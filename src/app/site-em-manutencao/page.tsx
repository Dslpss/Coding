"use client";
import { useEffect, useState } from "react";
import {
  FaTools,
  FaClock,
  FaExclamationTriangle,
  FaCode,
  FaServer,
  FaDatabase,
} from "react-icons/fa";
import Link from "next/link";
import useMaintenanceCheck from "@/lib/hooks/useMaintenanceCheck";
import { useRouter } from "next/navigation";

export default function MaintenancePage() {
  const router = useRouter();
  // Usar o hook de verificação de manutenção com recursos visuais
  const {
    isLoading,
    maintenanceMode: inMaintenance,
    countdown,
    progressPercent,
    checkCount,
    lastCheck,
    showCountdown,
  } = useMaintenanceCheck({
    redirectToMaintenance: false,
    redirectFromMaintenance: true,
    pollingInterval: 5000, // Verificar a cada 5 segundos (mais rápido para melhor UX)
    countdownFrom: 5,
    showVisualEffects: true,
  });

  // Animação de partículas de código
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }>
  >([]);

  useEffect(() => {
    // Criar partículas simulando código/dados fluindo
    const createParticles = () => {
      const newParticles = [];
      const count = Math.floor(window.innerWidth / 30); // Ajuste baseado no tamanho da tela

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: 1 + Math.random() * 3,
          speed: 0.3 + Math.random() * 2,
          opacity: 0.1 + Math.random() * 0.4,
        });
      }

      setParticles(newParticles);
    };

    createParticles();

    const moveParticles = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: particle.y + particle.speed,
          x: particle.x + (Math.random() - 0.5),
          // Reiniciar partículas que saem da tela
          ...(particle.y > window.innerHeight
            ? {
                y: -10,
                x: Math.random() * window.innerWidth,
              }
            : {}),
        }))
      );
    }, 50);

    // Recriar partículas ao redimensionar
    const handleResize = () => {
      createParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(moveParticles);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // Componente de carregamento com animação e efeito de pulso
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center space-x-2">
      {[0, 150, 300].map((delay) => (
        <div
          key={delay}
          className="h-3 w-3 bg-blue-400 rounded-full animate-bounce transition-all duration-300 hover:bg-blue-300"
          style={{
            animationDelay: `${delay}ms`,
            boxShadow: `0 0 8px rgba(96, 165, 250, 0.6)`,
          }}
        />
      ))}
    </div>
  );

  useEffect(() => {
    if (!isLoading && !inMaintenance) {
      router.replace("/auth");
    }
  }, [isLoading, inMaintenance, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 p-4 text-white text-center relative overflow-hidden">
      {/* Partículas de fundo */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-blue-400 rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px rgba(59, 130, 246, 0.7)`,
            zIndex: 0,
          }}
        />
      ))}

      {/* Elementos flutuantes de decoração */}
      <div className="absolute top-1/4 left-1/6 text-blue-500 opacity-20 animate-float">
        <FaCode className="text-5xl transform rotate-12" />
      </div>
      <div className="absolute bottom-1/4 right-1/5 text-blue-400 opacity-20 animate-float-delayed">
        <FaServer className="text-5xl transform -rotate-12" />
      </div>
      <div className="absolute top-1/2 right-1/4 text-blue-300 opacity-15 animate-pulse">
        <FaDatabase className="text-4xl" />
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-lg p-8 bg-blue-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-blue-700/30 z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-600/30 to-blue-400/30 p-5 rounded-full">
            <FaTools className="text-5xl text-blue-300 animate-pulse" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-blue-400">
          Site em Manutenção
        </h1>
        <p className="text-lg mb-8 text-blue-100">
          Estamos implementando melhorias em nosso sistema para proporcionar uma
          experiência ainda melhor. Por favor, retorne em breve.
        </p>
        <div className="mb-8 p-5 bg-blue-700/20 backdrop-blur-md rounded-xl border border-blue-600/20">
          <div className="flex items-center mb-3 text-yellow-300">
            <FaExclamationTriangle className="mr-2 text-xl" />
            <span className="font-semibold text-xl">Comunicado</span>
          </div>

          <div className="relative">
            {/* Linha de tempo */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600/50"></div>

            {/* Etapas */}
            <div className="pl-6 pb-4 relative">
              <div className="absolute left-0 w-2 h-2 rounded-full bg-blue-400 mt-1.5 shadow-glow"></div>
              <h3 className="text-blue-200 font-semibold">Diagnóstico</h3>
              <p className="text-blue-100 text-sm mt-1">
                Identificação e análise dos pontos de melhoria.
              </p>
            </div>

            <div className="pl-6 pb-4 relative">
              <div className="absolute left-0 w-2 h-2 rounded-full bg-blue-400 mt-1.5 shadow-glow"></div>
              <h3 className="text-blue-200 font-semibold">Implementação</h3>
              <p className="text-blue-100 text-sm mt-1">
                Nossos desenvolvedores estão implementando melhorias nos
                servidores.
              </p>
            </div>

            <div className="pl-6 relative">
              <div className="absolute left-0 w-2 h-2 rounded-full bg-blue-300 animate-pulse mt-1.5 shadow-glow"></div>
              <h3 className="text-blue-200 font-semibold">Finalização</h3>
              <p className="text-blue-100 text-sm mt-1">
                Agradecemos sua compreensão. Em breve estaremos de volta com uma
                experiência ainda melhor!
              </p>
            </div>
          </div>
        </div>{" "}
        {/* Status da verificação */}
        <div className="mb-6 px-4 py-2 bg-blue-800/40 rounded-lg text-blue-300 text-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isLoading ? <LoadingSpinner /> : "Verificação: "}
            {checkCount > 0 ? `${checkCount}x` : "aguardando..."}
          </div>
          <div className="w-24 bg-blue-900/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-400 h-2 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div>
            {lastCheck ? new Date(lastCheck).toLocaleTimeString() : "--:--"}
          </div>
        </div>{" "}
        {/* Mostrar mensagem de redirecionamento apenas quando a manutenção for concluída
            (quando estamos na página de manutenção, mas o modo de manutenção foi desativado) */}
        {showCountdown && !isLoading && !inMaintenance && (
          <div className="my-6 p-4 bg-green-700/30 rounded-xl border border-green-500/30 animate-pulse">
            <p className="text-green-200 flex items-center justify-center text-lg">
              <FaClock className="mr-3 text-xl" />
              Manutenção concluída! Redirecionando em {countdown} segundos...
            </p>
            <div className="w-full bg-green-900/30 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-green-500 h-2 transition-all duration-300"
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 rounded-lg shadow-lg shadow-blue-900/50 overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-0 w-0 h-full bg-blue-500/20 group-hover:w-full transition-all duration-500"></span>
            <span className="relative flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Voltar para Home
            </span>
          </Link>

          <button
            onClick={() => location.reload()}
            className="group relative px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 rounded-lg shadow-lg overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-0 w-0 h-full bg-gray-500/10 group-hover:w-full transition-all duration-500"></span>
            <span className="relative flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Atualizar Página
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10 opacity-70 z-10">
        <p className="text-blue-300">
          © {new Date().getFullYear()} Self Coding
        </p>
      </div>
    </div>
  );
}
