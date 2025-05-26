import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

// GET: Buscar capítulos de um curso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    console.log("=== GET /api/admin/courses/[courseId]/chapters ===");

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

    const { courseId } = await params;
    console.log(`🔍 Buscando capítulos do curso: ${courseId}`);

    // Buscar capítulos
    const chaptersRef = db
      .collection("cursos")
      .doc(courseId)
      .collection("chapters");
    const chaptersSnapshot = await chaptersRef
      .orderBy("createdAt", "asc")
      .get();

    const chapters = await Promise.all(
      chaptersSnapshot.docs.map(async (chapterDoc) => {
        const chapterData = chapterDoc.data();

        // Buscar vídeos do capítulo
        const videosRef = chapterDoc.ref.collection("videos");
        const videosSnapshot = await videosRef
          .orderBy("createdAt", "asc")
          .get();

        const videos = videosSnapshot.docs.map((videoDoc) => ({
          id: videoDoc.id,
          ...videoDoc.data(),
          createdAt:
            videoDoc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        // Incluir vídeo legacy se existir
        const allVideos = [];
        if (chapterData.videoUrl && chapterData.videoTitulo) {
          allVideos.push({
            id: "legacy",
            titulo: chapterData.videoTitulo,
            url: chapterData.videoUrl,
            createdAt: chapterData.createdAt?.toDate?.()?.toISOString() || null,
          });
        }
        allVideos.push(...videos);

        return {
          id: chapterDoc.id,
          nome: chapterData.nome,
          videoUrl: chapterData.videoUrl,
          videoTitulo: chapterData.videoTitulo,
          createdAt: chapterData.createdAt?.toDate?.()?.toISOString() || null,
          videos: allVideos,
        };
      })
    );

    console.log(`✅ ${chapters.length} capítulos encontrados`);

    return NextResponse.json({ chapters });
  } catch (error: any) {
    console.error("❌ Erro ao buscar capítulos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST: Criar novo capítulo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    console.log("=== POST /api/admin/courses/[courseId]/chapters ===");

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
        { error: "Sem permissão para gerenciar cursos" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();
    const { nome, videoTitulo, videoUrl } = body;

    if (!nome?.trim()) {
      return NextResponse.json(
        { error: "Nome do capítulo é obrigatório" },
        { status: 400 }
      );
    }

    console.log(`📝 Criando capítulo: ${nome} para curso: ${courseId}`);

    // Criar capítulo
    const chapterData: any = {
      nome: nome.trim(),
      createdAt: new Date(),
    };

    // Adicionar vídeo legacy se fornecido
    if (videoTitulo?.trim() && videoUrl?.trim()) {
      chapterData.videoTitulo = videoTitulo.trim();
      chapterData.videoUrl = videoUrl.trim();
    }

    const chaptersRef = db
      .collection("cursos")
      .doc(courseId)
      .collection("chapters");
    const chapterRef = await chaptersRef.add(chapterData);

    const newChapter = {
      id: chapterRef.id,
      ...chapterData,
      createdAt: chapterData.createdAt.toISOString(),
      videos:
        chapterData.videoUrl && chapterData.videoTitulo
          ? [
              {
                id: "legacy",
                titulo: chapterData.videoTitulo,
                url: chapterData.videoUrl,
                createdAt: chapterData.createdAt.toISOString(),
              },
            ]
          : [],
    };

    console.log(`✅ Capítulo criado com ID: ${chapterRef.id}`);

    return NextResponse.json({
      message: "Capítulo criado com sucesso",
      chapter: newChapter,
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar capítulo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH: Editar capítulo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    console.log("=== PATCH /api/admin/courses/[courseId]/chapters ===");

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
        { error: "Sem permissão para gerenciar cursos" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();
    const { chapterId, nome, videoTitulo, videoUrl } = body;

    if (!chapterId || !nome?.trim()) {
      return NextResponse.json(
        { error: "chapterId e nome são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`📝 Editando capítulo: ${chapterId} do curso: ${courseId}`);

    // Atualizar capítulo
    const chapterRef = db
      .collection("cursos")
      .doc(courseId)
      .collection("chapters")
      .doc(chapterId);
    const updateData: any = {
      nome: nome.trim(),
    };

    // Atualizar campos legacy se fornecidos
    if (videoTitulo?.trim()) {
      updateData.videoTitulo = videoTitulo.trim();
    }
    if (videoUrl?.trim()) {
      updateData.videoUrl = videoUrl.trim();
    }

    await chapterRef.update(updateData);

    console.log(`✅ Capítulo ${chapterId} editado com sucesso`);

    return NextResponse.json({
      message: "Capítulo editado com sucesso",
    });
  } catch (error: any) {
    console.error("❌ Erro ao editar capítulo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Excluir capítulo
export async function DELETE(request: NextRequest) {
  try {
    console.log("=== DELETE /api/admin/courses/[courseId]/chapters ===");

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
        { error: "Sem permissão para gerenciar cursos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");

    if (!courseId || !chapterId) {
      return NextResponse.json(
        { error: "courseId e chapterId são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`🗑️ Excluindo capítulo: ${chapterId} do curso: ${courseId}`);

    // Excluir todos os vídeos do capítulo primeiro
    const videosRef = db
      .collection("cursos")
      .doc(courseId)
      .collection("chapters")
      .doc(chapterId)
      .collection("videos");
    const videosSnapshot = await videosRef.get();

    const batch = db.batch();
    videosSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Excluir o capítulo
    const chapterRef = db
      .collection("cursos")
      .doc(courseId)
      .collection("chapters")
      .doc(chapterId);
    batch.delete(chapterRef);

    await batch.commit();

    console.log(`✅ Capítulo ${chapterId} excluído com sucesso`);

    return NextResponse.json({
      message: "Capítulo excluído com sucesso",
    });
  } catch (error: any) {
    console.error("❌ Erro ao excluir capítulo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
