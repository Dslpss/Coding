import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/admin/users ===");
    // Verificar autenticação através do session cookie
    const sessionCookie = request.cookies.get("admin_session")?.value;
    console.log("Session cookie:", sessionCookie ? "Presente" : "Ausente");

    if (!sessionCookie) {
      console.log("❌ Cookie de sessão não encontrado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Inicializar Firebase Admin
    console.log("🔧 Inicializando Firebase Admin...");
    const app = initAdmin();
    const auth = getAuth(app);

    // Verificar se o session cookie é válido
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Verificar se é admin no Firestore
    const db = getFirestore(app);
    const adminId = decodedClaims.email.replace(/\./g, "_").replace("@", "_");
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (!adminDoc.exists || !adminDoc.data()?.active) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Extrair parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit") || "10";
    const startAfterParam = searchParams.get("startAfter");
    const searchTerm = searchParams.get("search") || "";

    const limitNumber = parseInt(limitParam, 10);

    // Construir query para usuários
    let usersQuery = db.collection("users").orderBy("email").limit(limitNumber);

    // Se tem termo de busca, filtrar por email
    if (searchTerm) {
      usersQuery = db
        .collection("users")
        .orderBy("email")
        .where("email", ">=", searchTerm)
        .where("email", "<=", searchTerm + "\uf8ff")
        .limit(limitNumber);
    }

    // Se tem startAfter para paginação
    if (startAfterParam && !searchTerm) {
      const startAfterDoc = await db
        .collection("users")
        .doc(startAfterParam)
        .get();
      if (startAfterDoc.exists) {
        usersQuery = usersQuery.startAfter(startAfterDoc);
      }
    }

    // Executar query
    const usersSnapshot = await usersQuery.get();

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        displayName: data.displayName || "Usuário sem nome",
        email: data.email || "Sem e-mail",
        photoURL: data.photoURL || null,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        lastLogin: data.lastLogin
          ? data.lastLogin.toDate().toISOString()
          : null,
        status: data.status || "active",
        matriculas: data.matriculas || 0,
      };
    });

    // Verificar se há mais documentos
    const hasMore = usersSnapshot.docs.length === limitNumber;
    const lastVisible =
      usersSnapshot.docs.length > 0
        ? usersSnapshot.docs[usersSnapshot.docs.length - 1].id
        : null;

    return NextResponse.json({
      users,
      hasMore,
      lastVisible,
      total: users.length,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    // Verificar permissão para gerenciar usuários
    const adminData = adminDoc.data();
    if (!adminData?.permissions?.manage_users) {
      return NextResponse.json(
        { error: "Permissão insuficiente" },
        { status: 403 }
      );
    }

    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Atualizar usuário
    await db
      .collection("users")
      .doc(userId)
      .update({
        ...updates,
        updatedAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    // Verificar permissão para gerenciar usuários
    const adminData = adminDoc.data();
    if (!adminData?.permissions?.manage_users) {
      return NextResponse.json(
        { error: "Permissão insuficiente" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    // Deletar usuário
    await db.collection("users").doc(userId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
