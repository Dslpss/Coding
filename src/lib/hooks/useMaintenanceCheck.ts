"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UseMaintenanceCheckOptions {
  redirectToMaintenance?: boolean;
  redirectFromMaintenance?: boolean;
  pollingInterval?: number; // em milissegundos
  countdownFrom?: number; // contagem regressiva a partir deste número
  showVisualEffects?: boolean; // mostrar efeitos visuais adicionais
}

/**
 * Hook para verificar se o sistema está em modo de manutenção
 * @param options Opções de configuração do hook
 * @returns Estado de manutenção e carregamento
 */
export default function useMaintenanceCheck(
  options: UseMaintenanceCheckOptions = {}
) {
  const {
    redirectToMaintenance = true,
    redirectFromMaintenance = false,
    pollingInterval = 30000, // 30 segundos por padrão
    countdownFrom = 5,
    showVisualEffects = true,
  } = options;

  const router = useRouter();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(countdownFrom);
  const [progressPercent, setProgressPercent] = useState(100);
  const [checkCount, setCheckCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [wasInMaintenance, setWasInMaintenance] = useState<boolean | null>(
    null
  );
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Verificar se o sistema está em modo de manutenção
  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const startTime = new Date();
        setLastCheck(startTime);

        const response = await fetch("/api/auth/settings");
        const data = await response.json();
        const inMaintenance = !!data.maintenanceMode;

        // Detectar mudança de estado da manutenção
        if (
          wasInMaintenance !== null &&
          wasInMaintenance &&
          !inMaintenance &&
          redirectFromMaintenance &&
          typeof window !== "undefined" &&
          window.location.pathname === "/site-em-manutencao"
        ) {
          // Manutenção foi desativada - iniciar contagem regressiva
          setShowCountdown(true);
          setCountdown(countdownFrom);

          // Limpar timer anterior se existir
          if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
          }

          redirectTimerRef.current = setInterval(() => {
            setCountdown((prev) => {
              const newWidth = ((prev - 1) / countdownFrom) * 100;
              setProgressPercent(newWidth);

              if (prev <= 1) {
                if (redirectTimerRef.current) {
                  clearInterval(redirectTimerRef.current);
                  redirectTimerRef.current = null;
                }
                router.push("/dashboard");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        setMaintenanceMode(inMaintenance);
        setWasInMaintenance(inMaintenance);
        setCheckCount((prev) => prev + 1);

        // Resetar progresso para 100% após cada verificação
        setProgressPercent(100);

        // Se está em modo de manutenção e deve redirecionar
        if (inMaintenance && redirectToMaintenance) {
          router.replace("/site-em-manutencao");
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar status de manutenção:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Verificar imediatamente
    checkMaintenanceStatus();

    // Configurar verificação periódica
    if (pollingInterval > 0) {
      const intervalId = setInterval(checkMaintenanceStatus, pollingInterval); // Atualizar a animação de progresso entre verificações
      if (showVisualEffects) {
        const animationInterval = setInterval(() => {
          setProgressPercent((prev) => {
            // Não precisa calcular baseado em lastCheck aqui
            // O progresso será atualizado na próxima verificação
            return Math.max(5, prev - 2); // Diminui gradualmente
          });
        }, 1000);

        return () => {
          clearInterval(intervalId);
          clearInterval(animationInterval);
          if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
          }
        };
      }
      return () => {
        clearInterval(intervalId);
        if (redirectTimerRef.current) {
          clearInterval(redirectTimerRef.current);
        }
      };
    }
  }, [
    router,
    redirectToMaintenance,
    redirectFromMaintenance,
    pollingInterval,
    countdownFrom,
    showVisualEffects,
    wasInMaintenance,
  ]);

  return {
    isLoading,
    maintenanceMode,
    countdown,
    progressPercent,
    checkCount,
    lastCheck,
    showCountdown,
  };
}
