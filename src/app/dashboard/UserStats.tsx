"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { FaClock, FaGraduationCap, FaAward } from "react-icons/fa";

export default function UserStats() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({
    totalCursos: 0,
    horasEstudo: 0,
    certificados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      try {
        // Busca as matrículas do usuário
        const matriculasSnap = await getDocs(
          query(collection(db, "matriculas"), where("userId", "==", user.uid))
        );

        // Calcular estatísticas básicas
        const totalCursos = matriculasSnap.size;

        // Aqui você pode adicionar a lógica para calcular horas de estudo e certificados
        // Valores de exemplo por enquanto
        const horasEstudo = totalCursos * 5; // 5 horas por curso
        const certificados = Math.floor(totalCursos / 2); // Um certificado a cada 2 cursos

        setStats({
          totalCursos,
          horasEstudo,
          certificados,
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  if (!user || loading)
    return <div className="animate-pulse">Carregando estatísticas...</div>;

  return (
    <div className="bg-purple-700 rounded-xl p-6 shadow-lg w-full">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <span>Meu Progresso</span>
      </h2>

      <div className="flex flex-col space-y-4 text-white">
        <div className="flex items-center">
          <div className="mr-4 bg-purple-800 p-3 rounded-full">
            <FaGraduationCap className="text-xl" />
          </div>
          <div>
            <p className="text-lg font-semibold">{stats.totalCursos}</p>
            <p className="text-sm text-purple-200">Cursos iniciados</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4 bg-purple-800 p-3 rounded-full">
            <FaClock className="text-xl" />
          </div>
          <div>
            <p className="text-lg font-semibold">{stats.horasEstudo}</p>
            <p className="text-sm text-purple-200">Horas de estudo</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4 bg-purple-800 p-3 rounded-full">
            <FaAward className="text-xl" />
          </div>
          <div>
            <p className="text-lg font-semibold">{stats.certificados}</p>
            <p className="text-sm text-purple-200">Certificados</p>
          </div>
        </div>

        <button className="mt-4 flex items-center justify-center bg-purple-800 hover:bg-purple-900 py-2 px-4 rounded-lg">
          <span className="mr-2">Ver detalhes</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
