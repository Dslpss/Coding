import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/admin/courses ===");

    // Verificar autenticação através do session cookie
    const sessionCookie = request.cookies.get("admin_session")?.value;
    console.log("Session cookie:", sessionCookie ? "Presente" : "Ausente");

    if (!sessionCookie) {
      console.log("❌ Cookie de sessão não encontrado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } // Inicializar Firebase Admin
    console.log("🔧 Inicializando Firebase Admin...");
    const app = initAdmin();
    const auth = getAuth(app);

    // Verificar se o session cookie é válido
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    console.log("✅ Session cookie válido para:", decodedClaims.email);

    // Verificar se é admin no Firestore
    const db = getFirestore(app);
    const adminId = decodedClaims.email.replace(/\./g, "_").replace("@", "_");
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (!adminDoc.exists || !adminDoc.data()?.active) {
      console.log("❌ Admin não encontrado ou inativo");
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    console.log("✅ Admin validado:", adminDoc.data()?.role);

    // Extrair parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit") || "50";
    const searchTerm = searchParams.get("search") || "";

    const limitNumber = parseInt(limitParam, 10);

    // Construir query para cursos
    let coursesQuery = db
      .collection("cursos")
      .orderBy("nome")
      .limit(limitNumber);

    // Se tem termo de busca, filtrar por nome
    if (searchTerm) {
      coursesQuery = db
        .collection("cursos")
        .orderBy("nome")
        .where("nome", ">=", searchTerm)
        .where("nome", "<=", searchTerm + "\uf8ff")
        .limit(limitNumber);
    }

    // Executar query
    const coursesSnapshot = await coursesQuery.get();
    console.log(`✅ ${coursesSnapshot.size} cursos encontrados`);

    const courses = coursesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || "Curso sem nome",
        titulo: data.titulo || data.nome || "Curso sem título",
        descricao: data.descricao || "Sem descrição",
        nivel: data.nivel || "Iniciante",
        preco: data.preco || 0,
        imagemUrl: data.imagemUrl || null,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        totalMatriculas: data.totalMatriculas || 0,
        status: data.status || "ativo",
      };
    });

    return NextResponse.json({
      courses,
      total: courses.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar cursos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/admin/courses ===");

    // Verificar autenticação
    const sessionCookie = request.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const app = initAdmin();
    const auth = getAuth(app);
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Verificar se é admin
    const db = getFirestore(app);
    const adminId = decodedClaims.email.replace(/\./g, "_").replace("@", "_");
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (!adminDoc.exists || !adminDoc.data()?.active) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Verificar permissão para gerenciar cursos
    const adminData = adminDoc.data();
    if (!adminData?.permissions?.manage_courses) {
      return NextResponse.json(
        { error: "Permissão insuficiente para gerenciar cursos" },
        { status: 403 }
      );
    }

    const { nome, descricao, nivel, preco, imagemUrl } = await request.json();

    if (!nome || !descricao) {
      return NextResponse.json(
        { error: "Nome e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar curso
    const courseData = {
      nome,
      titulo: nome, // Usar nome como título por padrão
      descricao,
      nivel: nivel || "Iniciante",
      preco: preco ? parseFloat(preco) : 0,
      imagemUrl: imagemUrl || null,
      status: "ativo",
      totalMatriculas: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decodedClaims.email,
    };

    const docRef = await db.collection("cursos").add(courseData);
    console.log("✅ Curso criado com ID:", docRef.id);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      course: { id: docRef.id, ...courseData },
    });
  } catch (error) {
    console.error("❌ Erro ao criar curso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("=== DELETE /api/admin/courses ===");

    // Verificar autenticação
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const app = initAdmin();
    const auth = getAuth(app);
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Verificar se é admin
    const db = getFirestore(app);
    const adminId = decodedClaims.email.replace(/\./g, "_").replace("@", "_");
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (!adminDoc.exists || !adminDoc.data()?.active) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Verificar permissão para gerenciar cursos
    const adminData = adminDoc.data();
    if (!adminData?.permissions?.manage_courses) {
      return NextResponse.json(
        { error: "Permissão insuficiente para gerenciar cursos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "ID do curso é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o curso existe
    const courseDoc = await db.collection("cursos").doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Deletar curso
    await db.collection("cursos").doc(courseId).delete();
    console.log("✅ Curso deletado:", courseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erro ao deletar curso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
