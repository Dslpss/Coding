import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/admin/stats ===");
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
    console.log("🔍 Verificando session cookie...");
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

    console.log("✅ Admin verificado:", decodedClaims.email);

    // Buscar estatísticas usando Firebase Admin (sem restrições)
    console.log("📊 Buscando estatísticas...");

    // Contar usuários
    const usersSnapshot = await db.collection("users").get();
    const totalAlunos = usersSnapshot.size;
    console.log("👥 Total de usuários:", totalAlunos);

    // Contar cursos
    const cursosSnapshot = await db.collection("cursos").get();
    const totalCursos = cursosSnapshot.size;
    console.log("📚 Total de cursos:", totalCursos);

    // Contar posts do blog
    const blogSnapshot = await db.collection("blog").get();
    const totalPosts = blogSnapshot.size;
    console.log("📝 Total de posts:", totalPosts);

    // Buscar atividades recentes
    const recentActivities = [];

    // Posts recentes do blog
    try {
      const recentBlogQuery = db
        .collection("blog")
        .orderBy("createdAt", "desc")
        .limit(3);
      const recentBlogSnapshot = await recentBlogQuery.get();

      recentBlogSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        recentActivities.push({
          id: doc.id,
          type: "post",
          title: data.title || "Novo post no blog",
          date: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          user: data.authorId || "Sistema",
        });
      });
    } catch (error) {
      console.log("Erro ao buscar posts recentes:", error);
    }

    // Usuários recentes
    try {
      const recentUsersQuery = db
        .collection("users")
        .orderBy("createdAt", "desc")
        .limit(3);
      const recentUsersSnapshot = await recentUsersQuery.get();

      recentUsersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        recentActivities.push({
          id: doc.id,
          type: "usuario",
          title: `Novo usuário: ${
            data.displayName || data.email || "Sem nome"
          }`,
          date: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          user: doc.id,
        });
      });
    } catch (error) {
      console.log("Erro ao buscar usuários recentes:", error);
    }

    // Matrículas recentes
    try {
      const recentMatriculasQuery = db
        .collection("matriculas")
        .orderBy("createdAt", "desc")
        .limit(3);
      const recentMatriculasSnapshot = await recentMatriculasQuery.get();

      recentMatriculasSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        recentActivities.push({
          id: doc.id,
          type: "matricula",
          title: `Nova matrícula: ${data.courseTitle || "Curso"}`,
          date: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          user: data.userId || "Sistema",
        });
      });
    } catch (error) {
      console.log("Erro ao buscar matrículas recentes:", error);
    }

    // Ordenar atividades por data (mais recentes primeiro)
    recentActivities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const stats = {
      totalAlunos,
      totalCursos,
      totalPosts,
      crescimentoMensal: 12.5, // Valor exemplo
      recentActivities: recentActivities.slice(0, 10), // Máximo 10 atividades
    };

    console.log("✅ Estatísticas coletadas:", stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
