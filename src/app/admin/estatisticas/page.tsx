"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import {
  FaChartLine,
  FaUserGraduate,
  FaCalendarAlt,
  FaBookOpen,
  FaExclamationTriangle,
} from "react-icons/fa";
import AlertBanner from "../components/AlertBanner";
import { checkAdminStatus, formatTimestamp } from "../utils/adminUtils";

export default function AdminEstatisticas() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalCursos: 0,
    totalMatriculas: 0,
    crescimento: 0,
  });
  // Função de verificação de admin importada de adminUtils

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Verificar se o usuário é admin
        const adminStatus = await checkAdminStatus(user.email || "");

        if (!adminStatus) {
          setError("Você não tem permissão para visualizar estas estatísticas");
          setLoading(false);
          return;
        }

        // Buscar dados para estatísticas
        const cursosSnap = await getDocs(collection(db, "cursos"));
        const cursosCount = cursosSnap.size;

        const matriculasSnap = await getDocs(collection(db, "matriculas"));
        const matriculasCount = matriculasSnap.size;

        const usersSnap = await getDocs(collection(db, "users"));
        const usersCount = usersSnap.size;

        // Atualizar o estado com as estatísticas
        setStats({
          totalAlunos: usersCount,
          totalCursos: cursosCount,
          totalMatriculas: matriculasCount,
          crescimento: 18, // Valor de exemplo
        });

        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        setError("Não foi possível carregar os dados");
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return <AlertBanner type="error" message={error} />;
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Relatórios e Estatísticas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaUserGraduate className="text-blue-700" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total de Alunos</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalAlunos}
            </p>
            <p className="text-xs text-green-600">70% ativos</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaBookOpen className="text-green-700" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total de Cursos</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalCursos}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <FaCalendarAlt className="text-purple-700" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Matrículas</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalMatriculas}
            </p>
            <p className="text-xs text-gray-500">
              Média:{" "}
              {stats.totalCursos
                ? (stats.totalMatriculas / stats.totalCursos).toFixed(1)
                : 0}
              /curso
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <FaChartLine className="text-red-700" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Crescimento</p>
            <p className="text-2xl font-bold text-gray-800">
              +{stats.crescimento}%
            </p>
            <p className="text-xs text-gray-500">últimos 30 dias</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 border-b pb-2 text-gray-700">
            Dashboard em desenvolvimento
          </h2>
          <p className="text-gray-700 mb-4">
            Os gráficos detalhados de análise estão sendo desenvolvidos. Aqui
            estão algumas das funcionalidades que serão implementadas:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Cursos mais populares com dados de matrícula</li>
            <li>Gráfico de matrículas mensais</li>
            <li>Distribuição geográfica dos alunos</li>
            <li>Taxa de conclusão dos cursos</li>
            <li>Análise de engajamento dos alunos</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 border-b pb-2 text-gray-700">
            Matrículas nos Últimos 6 Meses
          </h2>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 italic">Gráfico em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
