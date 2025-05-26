import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

// POST: Adicionar vídeo a um capítulo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    console.log(
      "=== POST /api/admin/courses/[courseId]/chapters/[chapterId]/videos ==="
    );

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

    const { courseId, chapterId } = await params;
    const body = await request.json();
    const { titulo, url } = body;

    if (!titulo?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Título e URL do vídeo são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`📹 Adicionando vídeo: ${titulo} ao capítulo: ${chapterId}`);

    // Adicionar vídeo
    const videoData = {
      titulo: titulo.trim(),
      url: url.trim(),
      createdAt: new Date(),
    };

    const videosRef = db
      .collection("cursos")
      .doc(courseId)
      .collection("chapters")
      .doc(chapterId)
      .collection("videos");
    const videoRef = await videosRef.add(videoData);

    const newVideo = {
      id: videoRef.id,
      ...videoData,
      createdAt: videoData.createdAt.toISOString(),
    };

    console.log(`✅ Vídeo adicionado com ID: ${videoRef.id}`);

    return NextResponse.json({
      message: "Vídeo adicionado com sucesso",
      video: newVideo,
    });
  } catch (error: any) {
    console.error("❌ Erro ao adicionar vídeo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Excluir vídeo
export async function DELETE(request: NextRequest) {
  try {
    console.log(
      "=== DELETE /api/admin/courses/[courseId]/chapters/[chapterId]/videos ==="
    );

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
    const videoId = searchParams.get("videoId");

    if (!courseId || !chapterId || !videoId) {
      return NextResponse.json(
        { error: "courseId, chapterId e videoId são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`🗑️ Excluindo vídeo: ${videoId}`);

    // Excluir vídeo
    const videoRef = db
      .collection("cursos")
      .doc(courseId)
      .collection("chapters")
      .doc(chapterId)
      .collection("videos")
      .doc(videoId);
    await videoRef.delete();

    console.log(`✅ Vídeo ${videoId} excluído com sucesso`);

    return NextResponse.json({
      message: "Vídeo excluído com sucesso",
    });
  } catch (error: any) {
    console.error("❌ Erro ao excluir vídeo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
