"use client";
import { logger } from '@/lib/logger';

import { useState, useCallback, useEffect, useRef } from "react";

type ToastState = {
  message: string;
  type: "info" | "warning" | "success" | "error";
} | null;

interface UseCotacoesReturn {
  updatingPrices: boolean;
  lastPriceUpdate: string | null;
  cooldown: number;
  toast: ToastState;
  setToast: (toast: ToastState) => void;
  handleAtualizarCotacoes: (isManual?: boolean) => Promise<void>;
  getUpdateBtnText: () => string;
}

/**
 * Hook que encapsula toda a lógica de atualização de cotações,
 * cooldown de UI e exibição de toast.
 *
 * @param onSuccess Callback chamado após uma atualização bem-sucedida (ex: fetchPortfolio)
 */
export function useCotacoes(onSuccess: () => Promise<void>): UseCotacoesReturn {
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);

  // Manter referência estável ao onSuccess para evitar loops no useEffect
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  // Ticker de cooldown: decrementa 1 por segundo
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  const handleAtualizarCotacoes = useCallback(
    async (isManual = false) => {
      if (isManual && cooldown > 0) {
        setToast({
          message: `Aguarde ${cooldown}s antes de atualizar novamente.`,
          type: "warning",
        });
        return;
      }

      setUpdatingPrices(true);
      try {
        const res = await fetch("/api/cotacoes", { method: "POST" });
        const data = await res.json();

        // HTTP 429 = rate limit server-side atingido
        if (res.status === 429) {
          setToast({ message: data.message, type: "warning" });
          return;
        }

        if (res.ok && data.success && data.updatedCount > 0) {
          const agora = new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLastPriceUpdate(agora);
          await onSuccessRef.current();
          if (isManual) {
            setToast({ message: "Cotações atualizadas com sucesso!", type: "success" });
          }
        } else {
          setToast({
            message:
              data.message ||
              "Não foi possível atualizar as cotações. Exibindo dados em cache.",
            type: "warning",
          });
        }
      } catch (err: any) {
        logger.error("Erro ao buscar cotações em tempo real:", err);
        setToast({
          message: "Não foi possível atualizar as cotações. Exibindo dados em cache.",
          type: "warning",
        });
      } finally {
        setUpdatingPrices(false);
        if (isManual) {
          setCooldown(60);
        }
      }
    },
    [cooldown]
  );

  const getUpdateBtnText = useCallback(() => {
    if (updatingPrices) return "Buscando B3...";
    if (cooldown > 0) return `Aguarde ${cooldown}s...`;
    return "Atualizar Cotações";
  }, [updatingPrices, cooldown]);

  return {
    updatingPrices,
    lastPriceUpdate,
    cooldown,
    toast,
    setToast,
    handleAtualizarCotacoes,
    getUpdateBtnText,
  };
}
