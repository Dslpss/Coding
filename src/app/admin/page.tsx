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
        console.log("🔍 Buscando estatísticas via API...");
        setLoading(true);

        // Buscar estatísticas via API
        const response = await fetch("/api/admin/stats", {
          credentials: "include", // Incluir cookies de sessão
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Sessão expirada. Faça login novamente.");
          } else if (response.status === 403) {
            setError("Acesso negado. Permissões insuficientes.");
          } else {
            setError(`Erro ${response.status}: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        console.log("✅ Estatísticas recebidas:", data);

        // Atualizar estado com os dados recebidos
        setStats({
          totalAlunos: data.totalAlunos || 0,
          totalCursos: data.totalCursos || 0,
          totalPosts: data.totalPosts || 0,
          crescimentoMensal: data.crescimentoMensal || 0,
        });

        // Converter datas das atividades recentes
        const activities = (data.recentActivities || []).map(
          (activity: any) => ({
            ...activity,
            date: new Date(activity.date),
          })
        );

        setRecentActivity(activities);
        setError(null);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("❌ Erro ao buscar dados:", error);
        setError(error.message || "Erro ao carregar dados do painel");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
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
      />

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
        </div>

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
                  <p className="font-medium">Erro ao carregar dados</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
                          : new Date(activity.date).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </span>
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
