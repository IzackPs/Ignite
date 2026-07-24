"use client";


import { Modal } from "@/components/ui/Modal";
import { SimuladorAporteBar } from "@/components/SimuladorAporteBar";
import { PortfolioCalculado } from "@/lib/calculator";

interface SimuladorModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly portfolio: PortfolioCalculado;
  readonly onRefresh: () => void;
}

export function SimuladorModal({
  isOpen,
  onClose,
  portfolio,
  onRefresh,
}: SimuladorModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulador Inteligente de Aporte (Algoritmo Guloso)"
      description="Informe o orçamento disponível para simular a alocação perfeita com cálculo iterativo do troco resultante."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 pt-1">
        <SimuladorAporteBar
          portfolio={portfolio}
          onRefresh={() => {
            onRefresh();
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
