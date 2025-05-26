import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const app = initAdmin();
    const db = getFirestore(app); // Simplificar query para evitar necessidade de índice composto
    let cursosQuery;

    if (search) {
      // Para busca, usar apenas ordenação por nome
      cursosQuery = db
        .collection("cursos")
        .orderBy("nome")
        .where("nome", ">=", search)
        .where("nome", "<=", search + "\uf8ff")
        .limit(limit);
    } else {
      // Para listagem geral, não usar filtro de status para evitar índice composto
      cursosQuery = db
        .collection("cursos")
        .orderBy("createdAt", "desc")
        .limit(limit);
    }
    const cursosSnapshot = await cursosQuery.get();
    console.log(`✅ ${cursosSnapshot.size} cursos encontrados`);

    // Filtrar apenas cursos ativos após buscar os dados
    const cursos = cursosSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return !data.status || data.status === "ativo"; // Incluir cursos sem status ou com status ativo
      })
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          titulo: data.nome || data.titulo || "Curso sem título",
          nome: data.nome || data.titulo || "Curso sem nome",
          descricao: data.descricao || "Descrição não disponível",
          nivel: data.nivel || "Iniciante",
          preco: data.preco || 0,
          imagemUrl: data.imagemUrl || null,
          createdAt: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : null,
          // Calcular informações dinâmicas baseadas nos capítulos
          aulas: 0, // Será calculado
          duracao: "4 semanas", // Valor padrão
          tags: ["Programação"], // Valor padrão
        };
      });

    console.log(`✅ ${cursos.length} cursos ativos filtrados`);

    // Para cada curso, buscar capítulos para calcular número de aulas
    const cursosComDetalhes = await Promise.all(
      cursos.map(async (curso) => {
        try {
          const capitulosSnapshot = await db
            .collection("cursos")
            .doc(curso.id)
            .collection("capitulos")
            .get();

          let totalAulas = 0;

          // Contar vídeos em todos os capítulos
          for (const capDoc of capitulosSnapshot.docs) {
            const videosSnapshot = await db
              .collection("cursos")
              .doc(curso.id)
              .collection("capitulos")
              .doc(capDoc.id)
              .collection("videos")
              .get();

            totalAulas += videosSnapshot.size;
          }

          return {
            ...curso,
            aulas: totalAulas,
            duracao:
              totalAulas > 0
                ? `${Math.ceil(totalAulas / 3)} semanas`
                : "4 semanas",
          };
        } catch (error) {
          console.error(`Erro ao buscar detalhes do curso ${curso.id}:`, error);
          return curso; // Retorna curso sem detalhes adicionais
        }
      })
    );

    return NextResponse.json({
      cursos: cursosComDetalhes,
      total: cursosComDetalhes.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar cursos públicos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
