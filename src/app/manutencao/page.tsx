"use client";
import { useEffect, useState } from "react";
import { FaTools, FaToggleOn, FaToggleOff } from "react-icons/fa";
import Link from "next/link";

export default function ManutencaoPage() {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Carregar configurações atuais
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/settings");
        const data = await response.json();
        setMaintenanceMode(!!data.maintenanceMode);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        setMessage("Erro ao carregar configurações. Tente novamente.");
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 p-4 text-white">
      <div className="max-w-md w-full p-8 bg-blue-800/30 backdrop-blur-sm rounded-xl shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-500/20 p-4 rounded-full">
            <FaTools className="text-4xl text-yellow-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">
          Modo de Manutenção
        </h1>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Carregando configurações...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-900/40 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Status Atual</h2>
              <div className="flex items-center justify-between">
                <span>Modo de manutenção:</span>
                <span
                  className={`flex items-center ${
                    maintenanceMode ? "text-yellow-300" : "text-green-400"
                  }`}
                >
                  {maintenanceMode ? (
                    <>
                      <FaToggleOn className="mr-2" /> Ativado
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="mr-2" /> Desativado
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="bg-blue-900/40 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Informações</h2>
              <p>Quando o modo de manutenção está ativado:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  Os usuários são redirecionados para a página de manutenção
                </li>
                <li>Os usuários não conseguem fazer login</li>
                <li>
                  Usuários já logados são redirecionados para a página de
                  manutenção
                </li>
              </ul>
            </div>

            {message && (
              <div className="p-3 bg-blue-700/30 rounded-lg text-center">
                {message}
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
              <Link
                href="/admin/configuracoes"
                className="px-6 py-3 bg-blue-700 hover:bg-blue-600 transition-colors rounded-lg shadow-lg text-center"
              >
                Ir para Configurações
              </Link>

              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg shadow-lg text-center"
              >
                Voltar para Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
