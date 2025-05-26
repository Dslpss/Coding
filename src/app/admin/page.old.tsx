"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminStats from "./AdminStats";
import {
  FaBookOpen,
  FaUsers,
  FaNewspaper,
  FaChartBar,
  FaExclamationTriangle,
} from "react-icons/fa";

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  user?: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalCursos: 0,
    totalPosts: 0,
    crescimentoMensal: 12.5, // Valor de exemplo
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obter dados da sessão admin
        const session = getAdminSession();
        if (!session) {
          setError("Sessão administrativa não encontrada");
          setLoading(false);
          return;
        }

        console.log("Iniciando busca de dados administrativos...");

        // Buscar estatísticas e atividades recentes
        console.log(`Admin ${session.email} acessando painel`);

        // Inicializa contadores
        let cursosCount = 0;
        let postsCount = 0;
        let alunosCount = 0;
        let recentActivitiesList: RecentActivity[] = [];

        // Buscar cursos - pela regra do Firestore, esta coleção tem leitura pública
        try {
          const cursosSnapshot = await getDocs(collection(db, "cursos"));
          cursosCount = cursosSnapshot.size;
          console.log(`Total de cursos encontrados: ${cursosCount}`);
        } catch (err) {
          console.log("Erro ao buscar cursos:", err);
        }

        // Buscar posts do blog - pela regra do Firestore, esta coleção tem leitura pública
        try {
          const blogSnapshot = await getDocs(collection(db, "blog"));
          postsCount = blogSnapshot.size;
          console.log(`Total de posts encontrados: ${postsCount}`);

          // Buscar posts recentes do blog independentemente do tamanho da coleção
          try {
            // Correção: Buscamos posts do blog diretamente, mesmo se blogSnapshot.size for 0
            const blogQuery = query(
              collection(db, "blog"),
              orderBy("createdAt", "desc"),
              limit(5) // Aumentamos o limite para garantir mais posts
            );
            const recentBlogSnapshot = await getDocs(blogQuery);

            console.log("Posts do blog encontrados:", recentBlogSnapshot.size);

            const blogActivities = recentBlogSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                type: "post",
                title: data.title || "Novo post no blog",
                date: data.createdAt?.toDate() || new Date(), // Convertemos Timestamp para Date
                user: data.authorId,
              };
            });

            recentActivitiesList = [...recentActivitiesList, ...blogActivities];
          } catch (err) {
            console.log("Erro ao buscar posts recentes:", err);
          }
        } catch (err) {
          console.log("Erro ao buscar blog:", err);
        }

        // Buscar usuários
        try {
          const usuariosSnapshot = await getDocs(collection(db, "users"));
          alunosCount = usuariosSnapshot.size;
          console.log("Total de alunos encontrados:", alunosCount); // Adicionar atividades recentes de usuários
          if (usuariosSnapshot.size > 0) {
            // Obter os 5 usuários mais recentes para mostrar na atividade
            const recentUsersQuery = query(
              collection(db, "users"),
              orderBy("createdAt", "desc"),
              limit(5)
            );

            const recentUsersSnapshot = await getDocs(recentUsersQuery);
            const userActivities = recentUsersSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                type: "usuario",
                title: `Novo usuário: ${
                  data.displayName || data.email || "Sem nome"
                }`,
                date: data.createdAt || new Date(),
                user: doc.id,
              };
            });

            recentActivitiesList = [...recentActivitiesList, ...userActivities];
          }
        } catch (err) {
          console.log("Erro ao buscar usuários:", err);
          // Não é um erro crítico, apenas não mostramos este dado
        }

        // Buscar matrículas
        try {
          const matriculasQuery = query(
            collection(db, "matriculas"),
            orderBy("createdAt", "desc"),
            limit(5)
          );

          const matriculasSnapshot = await getDocs(matriculasQuery);
          console.log(`Matrículas encontradas: ${matriculasSnapshot.size}`);

          const matriculasActivities = matriculasSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              type: "matricula",
              title: `Nova matrícula: ${
                data.cursoNome || "Curso não especificado"
              }`,
              date: data.createdAt || new Date(),
              user: data.userId,
            };
          });

          recentActivitiesList = [
            ...recentActivitiesList,
            ...matriculasActivities,
          ];
        } catch (err) {
          console.log("Erro ao buscar matrículas:", err);
        }

        // Definir estatísticas com os dados disponíveis
        setStats({
          totalAlunos: alunosCount,
          totalCursos: cursosCount,
          totalPosts: postsCount,
          crescimentoMensal: 12.5, // Valor de exemplo
        });

        // Organizar atividades recentes por data (mais recentes primeiro)
        recentActivitiesList.sort((a: RecentActivity, b: RecentActivity) => {
          // Converte datas se necessário
          const dateA =
            a.date instanceof Date
              ? a.date
              : a.date && a.date.seconds
              ? new Date(a.date.seconds * 1000)
              : new Date(0);

          const dateB =
            b.date instanceof Date
              ? b.date
              : b.date && b.date.seconds
              ? new Date(b.date.seconds * 1000)
              : new Date(0);

          // Ordena do mais recente para o mais antigo
          return dateB.getTime() - dateA.getTime();
        });
        setRecentActivity(recentActivitiesList.slice(0, 10));

        // Mostrar um log de sucesso
        console.log(
          `Dashboard carregado com sucesso: ${alunosCount} alunos, ${cursosCount} cursos, ${postsCount} posts, ${recentActivitiesList.length} atividades recentes`
        );

        // Remover qualquer erro anterior
        setError(null);
        setLoading(false);
      } catch (error: unknown) {
        console.error("Erro ao buscar dados:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao carregar dados";
        setError(errorMessage);
        // Mostrar dados fictícios para evitar quebra da interface
        setStats({
          totalAlunos: 0,
          totalCursos: 0,
          totalPosts: 0,
          crescimentoMensal: 0,
        });
        setRecentActivity([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {" "}
        <h1 className="text-2xl font-bold text-white">Painel de Controle</h1>
        <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
          Acesso completo
        </div>
      </div>
      {/* Stats Cards */}
      <AdminStats
        totalAlunos={stats.totalAlunos}
        totalCursos={stats.totalCursos}
        totalPosts={stats.totalPosts}
        crescimentoMensal={stats.crescimentoMensal}
        isLoading={loading}
      />{" "}
      {/* Quick Links & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Quick Links */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
            Acesso Rápido
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/cursos"
              className="flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-md mr-3">
                <FaBookOpen className="text-blue-600" />
              </div>
              <span className="text-gray-700">Gerenciar Cursos</span>
            </Link>

            <Link
              href="/admin/usuarios"
              className="flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="bg-green-100 p-2 rounded-md mr-3">
                <FaUsers className="text-green-600" />
              </div>
              <span className="text-gray-700">Gerenciar Usuários</span>
            </Link>

            <Link
              href="/admin/blog"
              className="flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="bg-purple-100 p-2 rounded-md mr-3">
                <FaNewspaper className="text-purple-600" />
              </div>
              <span className="text-gray-700">Gerenciar Blog</span>
            </Link>

            <Link
              href="/admin/estatisticas"
              className="flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="bg-red-100 p-2 rounded-md mr-3">
                <FaChartBar className="text-red-600" />
              </div>
              <span className="text-gray-700">Relatórios</span>
            </Link>
          </div>
        </div>{" "}
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
            Atividades Recentes
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center">
                <FaExclamationTriangle className="text-xl mr-2" />
                <div>
                  <p className="font-medium">Erro de permissão</p>
                  <p className="text-sm">
                    Não foi possível carregar as atividades recentes
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {" "}
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-l-4 pl-4 py-3 hover:bg-gray-50 transition-colors rounded group"
                    style={{
                      borderColor:
                        activity.type === "matricula"
                          ? "#10B981"
                          : activity.type === "post"
                          ? "#8B5CF6"
                          : activity.type === "usuario"
                          ? "#3B82F6"
                          : "#6B7280",
                    }}
                  >
                    <p className="text-gray-700 font-medium group-hover:text-black">
                      {activity.title}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {activity.date instanceof Date
                          ? activity.date.toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : activity.date && activity.date.seconds
                          ? new Date(
                              activity.date.seconds * 1000
                            ).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Data não disponível"}
                      </span>{" "}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          activity.type === "matricula"
                            ? "bg-green-100 text-green-800"
                            : activity.type === "post"
                            ? "bg-purple-100 text-purple-800"
                            : activity.type === "usuario"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {activity.type === "matricula"
                          ? "Matrícula"
                          : activity.type === "post"
                          ? "Blog"
                          : activity.type === "usuario"
                          ? "Usuário"
                          : activity.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-8">
                  Nenhuma atividade recente encontrada.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
