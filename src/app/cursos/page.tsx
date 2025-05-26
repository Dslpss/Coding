"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { matricularUsuarioNoCurso } from "../matricular-curso";
import CursosMenu from "./components/CursosMenu";
import {
  FaBookOpen,
  FaClock,
  FaGraduationCap,
  FaPlay,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";

interface Curso {
  id: string;
  titulo?: string;
  nome?: string;
  descricao?: string;
  nivel?: string;
  duracao?: string;
  aulas?: number;
  preco?: number;
  imagemUrl?: string;
  tags?: string[];
  createdAt?: Date | null;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [user] = useAuthState(auth);
  const [matriculando, setMatriculando] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [matriculasUsuario, setMatriculasUsuario] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalCursos: 0,
    totalAlunos: 0,
    horasConteudo: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 Buscando cursos via API...");

        // Buscar cursos via API
        const response = await fetch("/api/cursos");

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Cursos encontrados:", data.cursos.length);

        // Converter datas de string para objetos Date
        const cursosData = data.cursos.map((curso: any) => ({
          ...curso,
          createdAt: curso.createdAt ? new Date(curso.createdAt) : null,
          tags: curso.tags || ["Programação"],
        }));

        setCursos(cursosData);

        // Calcular estatísticas baseadas em dados reais
        setStats({
          totalCursos: cursosData.length,
          totalAlunos: cursosData.length * 25, // Simulado - pode ser calculado de matrículas reais
          horasConteudo:
            cursosData.reduce(
              (acc: number, curso: Curso) => acc + (curso.aulas || 0),
              0
            ) * 2, // 2h por aula
        });
      } catch (error) {
        console.error("❌ Erro ao buscar dados:", error);
        setMsg("Erro ao carregar cursos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Buscar matrículas quando o usuário muda
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setMatriculasUsuario([]);
        return;
      }

      try {
        const matriculasQuery = query(
          collection(db, "matriculas"),
          where("userId", "==", user.uid)
        );
        const matriculasSnap = await getDocs(matriculasQuery);
        const cursosMatriculados = matriculasSnap.docs.map(
          (doc) => doc.data().cursoId
        );
        setMatriculasUsuario(cursosMatriculados);
      } catch (error) {
        console.error("Erro ao buscar matrículas:", error);
      }
    };

    fetchData();
  }, [user]);
  // Atualizar matrículas quando a página ganha foco (para sincronizar com outras abas)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        const refreshMatriculas = async () => {
          try {
            const matriculasQuery = query(
              collection(db, "matriculas"),
              where("userId", "==", user.uid)
            );
            const matriculasSnap = await getDocs(matriculasQuery);
            const cursosMatriculados = matriculasSnap.docs.map(
              (doc) => doc.data().cursoId
            );
            setMatriculasUsuario(cursosMatriculados);
          } catch (error) {
            console.error("Erro ao atualizar matrículas:", error);
          }
        };
        refreshMatriculas();
      }
    };

    // Listener para eventos personalizados de desmatrícula
    const handleDesmatricula = () => {
      if (user) {
        const refreshMatriculas = async () => {
          try {
            const matriculasQuery = query(
              collection(db, "matriculas"),
              where("userId", "==", user.uid)
            );
            const matriculasSnap = await getDocs(matriculasQuery);
            const cursosMatriculados = matriculasSnap.docs.map(
              (doc) => doc.data().cursoId
            );
            setMatriculasUsuario(cursosMatriculados);
          } catch (error) {
            console.error("Erro ao atualizar matrículas:", error);
          }
        };
        refreshMatriculas();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("cursoDesmatriculado", handleDesmatricula);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("cursoDesmatriculado", handleDesmatricula);
    };
  }, [user]);
  const handleMatricular = async (cursoId: string) => {
    if (!user) {
      setMsg("Faça login para se matricular.");
      return;
    }
    setMatriculando(cursoId);
    setMsg("");
    try {
      await matricularUsuarioNoCurso(user.uid, cursoId);
      setMsg("Matrícula realizada com sucesso!");
      // Atualizar a lista de matrículas do usuário
      setMatriculasUsuario((prev) => [...prev, cursoId]);
    } catch {
      setMsg("Erro ao matricular. Tente novamente.");
    }
    setMatriculando(null);
  };

  // Função para verificar se o usuário já está matriculado no curso
  const isMatriculado = (cursoId: string) => {
    return matriculasUsuario.includes(cursoId);
  };
  const getNivelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case "iniciante":
        return "bg-green-100 text-green-800";
      case "intermediário":
        return "bg-yellow-100 text-yellow-800";
      case "avançado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header com Estatísticas */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Cursos SelfCoding
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Aprenda programação com os melhores cursos online
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.totalCursos}
              </div>
              <div className="text-blue-200 text-sm">Cursos Disponíveis</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.totalAlunos}+
              </div>
              <div className="text-blue-200 text-sm">Alunos Matriculados</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.horasConteudo}h
              </div>
              <div className="text-blue-200 text-sm">Horas de Conteúdo</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Lateral */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <CursosMenu />
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:w-3/4 space-y-8">
            {/* Mensagem de Feedback */}
            {msg && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  msg.includes("sucesso")
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : msg.includes("Erro")
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                }`}
              >
                {msg.includes("sucesso") ? (
                  <FaCheck className="w-5 h-5" />
                ) : (
                  <FaExclamationCircle className="w-5 h-5" />
                )}
                {msg}
              </div>
            )}

            {/* Lista de Cursos */}
            {cursos.length === 0 ? (
              <div className="text-center py-12">
                <FaBookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhum curso disponível
                </h3>
                <p className="text-blue-200">
                  Novos cursos serão adicionados em breve!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {cursos.map((curso) => (
                  <div
                    key={curso.id}
                    className="group bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Imagem do Curso */}
                    <div className="relative h-48 overflow-hidden">
                      {curso.imagemUrl ? (
                        <img
                          src={curso.imagemUrl}
                          alt={curso.titulo}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                          <FaGraduationCap className="w-16 h-16 text-white/60" />
                        </div>
                      )}{" "}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {/* Indicadores */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between">
                        {isMatriculado(curso.id) && (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <FaCheck className="w-3 h-3" />
                            Matriculado
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelColor(
                            curso.nivel || ""
                          )} ${isMatriculado(curso.id) ? "ml-auto" : ""}`}
                        >
                          {curso.nivel}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {curso.titulo}
                      </h3>

                      <p className="text-blue-100 text-sm mb-4 line-clamp-2">
                        {curso.descricao}
                      </p>

                      {/* Informações do Curso */}
                      <div className="flex items-center gap-4 text-blue-200 text-sm mb-4">
                        <span className="flex items-center gap-1">
                          <FaClock className="w-4 h-4" />
                          {curso.duracao}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaPlay className="w-4 h-4" />
                          {curso.aulas} aulas
                        </span>
                      </div>

                      {/* Tags */}
                      {curso.tags && curso.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {curso.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <Link href={`/cursos/${curso.id}`}>
                          <span className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer">
                            Ver detalhes →
                          </span>
                        </Link>{" "}
                        {isMatriculado(curso.id) ? (
                          <Link href={`/dashboard`}>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                              <FaCheck className="w-4 h-4" />
                              Matriculado
                            </button>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleMatricular(curso.id)}
                            disabled={matriculando === curso.id || !user}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                              !user
                                ? "bg-gray-600 text-white cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {matriculando === curso.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Matriculando...
                              </>
                            ) : !user ? (
                              <>
                                <FaExclamationCircle className="w-4 h-4" />
                                Faça Login
                              </>
                            ) : (
                              <>
                                <FaGraduationCap className="w-4 h-4" />
                                Matricular-se
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
