"use client";
import {
  FaUserGraduate,
  FaBookOpen,
  FaNewspaper,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useState, useEffect } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: JSX.Element;
  color: string;
  change?: number;
  isLoading?: boolean;
  hasError?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  color,
  change,
  isLoading,
  hasError,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div
        className={`${color} rounded-lg shadow-lg p-6 flex justify-between items-center animate-pulse opacity-70`}
      >
        <div className="w-full">
          <div className="h-4 w-20 bg-white/30 rounded mb-2"></div>
          <div className="h-8 w-16 bg-white/40 rounded"></div>
        </div>
        <div className="bg-white/20 p-3 rounded-full">{icon}</div>
      </div>
    );
  }
  if (hasError) {
    return (
      <div className="bg-gray-600/80 rounded-lg shadow-lg p-6 flex justify-between items-center">
        <div>
          <h3 className="text-gray-100 text-sm font-medium">{title}</h3>
          <div className="flex flex-col">
            <p className="text-white text-xl font-bold">Indisponível</p>
            <p className="text-white/70 text-xs mt-1">
              Erro de permissão ou coleção vazia
            </p>
          </div>
        </div>
        <div className="bg-red-500/30 p-3 rounded-full">
          <FaExclamationTriangle className="text-white text-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${color} rounded-lg shadow-lg p-6 flex justify-between items-center`}
    >
      <div>
        <h3 className="text-gray-100 text-sm font-medium">{title}</h3>
        <div className="flex items-baseline">
          <p className="text-white text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <span
              className={`ml-2 text-sm ${
                change >= 0 ? "text-green-300" : "text-red-300"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
      </div>
      <div className="bg-white/20 p-3 rounded-full">{icon}</div>
    </div>
  );
}

interface AdminStatsProps {
  totalAlunos: number;
  totalCursos: number;
  totalPosts: number;
  crescimentoMensal: number;
  isLoading?: boolean;
}

export default function AdminStats({
  totalAlunos = 0,
  totalCursos = 0,
  totalPosts = 0,
  crescimentoMensal = 0,
  isLoading = false,
}: Partial<AdminStatsProps>) {
  // Estado para rastrear erros de acesso a dados
  const [hasPermissionError, setHasPermissionError] = useState({
    alunos: false,
    cursos: false,
    posts: false,
  });
  useEffect(() => {
    if (!isLoading) {
      // Verificar se temos problemas de permissão para cada tipo de dado
      // Ajustamos a lógica para considerar:
      // 1. Para alunos: só consideramos erro se for exatamente 0, já que isso indica
      //    provável problema de permissão para "users"
      // 2. Para cursos e posts: não consideramos erro se for 0, já que
      //    pode simplesmente não existir nenhum ainda (leitura é pública)
      setHasPermissionError({
        alunos: totalAlunos === 0, // Isso pode ser um erro de permissão com a coleção "users"
        cursos: false, // Não consideramos erro já que a leitura é pública
        posts: false, // Não consideramos erro já que a leitura é pública
      });
    }
  }, [totalAlunos, totalCursos, totalPosts, isLoading]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Alunos"
        value={totalAlunos}
        icon={<FaUserGraduate className="text-white text-xl" />}
        color="bg-gradient-to-r from-blue-600 to-blue-800"
        change={5.2}
        isLoading={isLoading}
        hasError={hasPermissionError.alunos}
      />
      <StatCard
        title="Cursos Ativos"
        value={totalCursos}
        icon={<FaBookOpen className="text-white text-xl" />}
        color="bg-gradient-to-r from-purple-600 to-purple-800"
        change={2.8}
        isLoading={isLoading}
        hasError={hasPermissionError.cursos}
      />
      <StatCard
        title="Posts no Blog"
        value={totalPosts}
        icon={<FaNewspaper className="text-white text-xl" />}
        color="bg-gradient-to-r from-green-600 to-green-800"
        change={8.1}
        isLoading={isLoading}
        hasError={hasPermissionError.posts}
      />
      <StatCard
        title="Crescimento Mensal"
        value={`${crescimentoMensal}%`}
        icon={<FaChartLine className="text-white text-xl" />}
        color="bg-gradient-to-r from-red-600 to-red-800"
        isLoading={isLoading}
      />
    </div>
  );
}
