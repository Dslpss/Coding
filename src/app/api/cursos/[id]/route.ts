import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id: cursoId } = resolvedParams;

    if (!cursoId) {
      return NextResponse.json(
        { error: "ID do curso é obrigatório" },
        { status: 400 }
      );
    }

    const app = initAdmin();
    const db = getFirestore(app);

    // Buscar curso
    const cursoDoc = await db.collection("cursos").doc(cursoId).get();

    if (!cursoDoc.exists) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    const cursoData = cursoDoc.data();

    // Buscar capítulos do curso
    const capitulosSnapshot = await db
      .collection("cursos")
      .doc(cursoId)
      .collection("capitulos")
      .orderBy("createdAt", "asc")
      .get();

    const capitulos = await Promise.all(
      capitulosSnapshot.docs.map(async (capDoc) => {
        const capData = capDoc.data();

        // Buscar vídeos do capítulo
        const videosSnapshot = await db
          .collection("cursos")
          .doc(cursoId)
          .collection("capitulos")
          .doc(capDoc.id)
          .collection("videos")
          .orderBy("createdAt", "asc")
          .get();

        const videos = videosSnapshot.docs.map((videoDoc) => {
          const videoData = videoDoc.data();
          return {
            id: videoDoc.id,
            titulo: videoData.titulo || "Vídeo sem título",
            url: videoData.url || "",
            createdAt: videoData.createdAt
              ? videoData.createdAt.toDate().toISOString()
              : null,
          };
        });

        return {
          id: capDoc.id,
          nome: capData.nome || "Capítulo sem nome",
          videoUrl: capData.videoUrl || "",
          videoTitulo: capData.videoTitulo || "",
          createdAt: capData.createdAt
            ? capData.createdAt.toDate().toISOString()
            : null,
          videos: videos,
        };
      })
    );

    // Calcular estatísticas
    const totalVideos = capitulos.reduce(
      (acc, cap) => acc + cap.videos.length,
      0
    );
    const totalAulas = totalVideos + capitulos.length; // Capítulos + vídeos extras

    const curso = {
      id: cursoDoc.id,
      titulo: cursoData?.nome || cursoData?.titulo || "Curso sem título",
      nome: cursoData?.nome || cursoData?.titulo || "Curso sem nome",
      descricao: cursoData?.descricao || "Descrição não disponível",
      nivel: cursoData?.nivel || "Iniciante",
      preco: cursoData?.preco || 0,
      imagemUrl: cursoData?.imagemUrl || null,
      createdAt: cursoData?.createdAt
        ? cursoData.createdAt.toDate().toISOString()
        : null,
      // Estatísticas calculadas
      aulas: totalAulas,
      duracao:
        totalAulas > 0 ? `${Math.ceil(totalAulas / 3)} semanas` : "4 semanas",
      capitulos: capitulos,
      totalCapitulos: capitulos.length,
      totalVideos: totalVideos,
    };

    console.log(
      `✅ Curso encontrado: ${curso.titulo} com ${capitulos.length} capítulos`
    );

    return NextResponse.json({ curso });
  } catch (error) {
    console.error("❌ Erro ao buscar curso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
