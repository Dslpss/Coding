"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import {
  FaBook,
  FaArrowRight,
  FaTrash,
  FaClock,
  FaStar,
  FaCalendarAlt,
  FaGraduationCap,
  FaChartLine,
  FaUser,
} from "react-icons/fa";

interface Curso {
  id: string;
  nome: string;
  descricao: string;
  nivel?: string;
  duracao?: string;
  instrutor?: string;
  categoria?: string;
  dataMatricula?: Date;
}

interface Matricula {
  id: string;
  cursoId: string;
  userId: string;
  dataMatricula: Date;
}

export default function MeusCursosPage() {
  const [user] = useAuthState(auth);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingCourse, setRemovingCourse] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;

    const fetchMeusCursos = async () => {
      setLoading(true);

      try {
        // Busca as matrículas do usuário
        const matriculasSnap = await getDocs(
          query(collection(db, "matriculas"), where("userId", "==", user.uid))
        );

        const matriculasData = matriculasSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dataMatricula: doc.data().dataMatricula?.toDate() || new Date(),
        })) as Matricula[];

        setMatriculas(matriculasData);

        if (matriculasData.length === 0) {
          setCursos([]);
          setLoading(false);
          return;
        }

        // Busca os dados dos cursos
        const cursosPromises = matriculasData.map(async (matricula) => {
          const cursoSnap = await getDoc(doc(db, "cursos", matricula.cursoId));
          const cursoData = cursoSnap.data();
          return cursoData
            ? ({
                id: matricula.cursoId,
                ...cursoData,
                dataMatricula: matricula.dataMatricula,
              } as Curso)
            : null;
        });

        const cursosData = (await Promise.all(cursosPromises)).filter(
          Boolean
        ) as Curso[];
        setCursos(
          cursosData.sort(
            (a, b) =>
              (b.dataMatricula?.getTime() || 0) -
              (a.dataMatricula?.getTime() || 0)
          )
        );
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeusCursos();
  }, [user]);
  const handleRemoveCourse = async (cursoId: string) => {
    if (
      !user ||
      !confirm("Tem certeza que deseja se desmatricular deste curso?")
    )
      return;

    setRemovingCourse(cursoId);
    try {
      // Encontra e remove a matrícula
      const matricula = matriculas.find((m) => m.cursoId === cursoId);
      if (matricula) {
        await deleteDoc(doc(db, "matriculas", matricula.id));
        // Atualiza o estado local
        setCursos(cursos.filter((curso) => curso.id !== cursoId));
        setMatriculas(matriculas.filter((m) => m.id !== matricula.id));

        // Dispara evento personalizado para notificar outras páginas
        window.dispatchEvent(
          new CustomEvent("cursoDesmatriculado", {
            detail: { cursoId, userId: user.uid },
          })
        );
      }
    } catch (error) {
      console.error("Erro ao remover curso:", error);
      alert("Erro ao se desmatricular do curso. Tente novamente.");
    } finally {
      setRemovingCourse(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getNivelColor = (nivel: string = "") => {
    switch (nivel.toLowerCase()) {
      case "iniciante":
        return "bg-green-500";
      case "intermediário":
      case "intermediario":
        return "bg-yellow-500";
      case "avançado":
      case "avancado":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
          Você precisa estar logado.{" "}
          <Link href="/auth" className="underline text-blue-200 ml-2">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-4"
          >
            ← Voltar ao Dashboard
          </Link>
          <div className="flex items-center mb-4">
            <FaGraduationCap className="text-4xl text-blue-300 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">Meus Cursos</h1>
              <p className="text-blue-200">
                Gerencie suas matrículas e acompanhe seu progresso
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6">
            <div className="flex items-center">
              <FaBook className="text-3xl text-blue-200 mr-4" />
              <div>
                <p className="text-blue-200 text-sm">Total de Cursos</p>
                <p className="text-2xl font-bold text-white">{cursos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6">
            <div className="flex items-center">
              <FaChartLine className="text-3xl text-green-200 mr-4" />
              <div>
                <p className="text-green-200 text-sm">Em Progresso</p>
                <p className="text-2xl font-bold text-white">{cursos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6">
            <div className="flex items-center">
              <FaStar className="text-3xl text-purple-200 mr-4" />
              <div>
                <p className="text-purple-200 text-sm">Concluídos</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="text-blue-200 mt-4">Carregando seus cursos...</p>
          </div>
        ) : cursos.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-800/20 rounded-xl p-8 max-w-md mx-auto">
              <FaBook className="text-6xl text-blue-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Nenhum curso encontrado
              </h2>
              <p className="text-blue-200 mb-6">
                Você ainda não está matriculado em nenhum curso. Explore nossa
                seleção e comece a aprender hoje!
              </p>
              <Link
                href="/cursos"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Explorar Cursos <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300 border border-blue-500/20"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-600 rounded-lg p-3 mr-4">
                      <FaBook className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {curso.nome}
                      </h3>
                      {curso.nivel && (
                        <span
                          className={`${getNivelColor(
                            curso.nivel
                          )} text-white text-xs px-2 py-1 rounded-full`}
                        >
                          {curso.nivel}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCourse(curso.id)}
                    disabled={removingCourse === curso.id}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Desmatricular-se do curso"
                  >
                    {removingCourse === curso.id ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>

                {/* Descrição */}
                <p className="text-blue-200 text-sm mb-4 line-clamp-2">
                  {curso.descricao}
                </p>

                {/* Informações do Curso */}
                <div className="space-y-2 mb-6">
                  {curso.instrutor && (
                    <div className="flex items-center text-blue-300 text-sm">
                      <FaUser className="mr-2" />
                      <span>Instrutor: {curso.instrutor}</span>
                    </div>
                  )}
                  {curso.duracao && (
                    <div className="flex items-center text-blue-300 text-sm">
                      <FaClock className="mr-2" />
                      <span>Duração: {curso.duracao}</span>
                    </div>
                  )}
                  {curso.dataMatricula && (
                    <div className="flex items-center text-blue-300 text-sm">
                      <FaCalendarAlt className="mr-2" />
                      <span>
                        Matriculado em: {formatDate(curso.dataMatricula)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                  <Link
                    href={`/cursos/${curso.id}`}
                    className="flex-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Continuar Curso <FaArrowRight className="ml-2" />
                  </Link>
                  <Link
                    href={`/progresso/${curso.id}`}
                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    <FaChartLine />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ação Rápida */}
        <div className="mt-12 text-center">
          <div className="bg-blue-800/20 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">
              Quer explorar mais conteúdo?
            </h3>
            <p className="text-blue-200 mb-4">
              Descubra novos cursos e expanda seus conhecimentos
            </p>
            <Link
              href="/cursos"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Ver Todos os Cursos <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
