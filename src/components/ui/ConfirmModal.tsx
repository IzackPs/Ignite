"use client";


import { AlertTriangle, Trash2, RotateCcw, ShoppingCart } from "lucide-react";

interface ConfirmModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title: string;
  readonly description: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly variant?: "danger" | "warning" | "primary" | "emerald";
  readonly loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-400" />,
          iconBg: "bg-rose-500/10 border-rose-500/20",
          button: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          iconBg: "bg-amber-500/10 border-amber-500/20",
          button: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20",
        };
      case "emerald":
        return {
          icon: <ShoppingCart className="w-6 h-6 text-emerald-400" />,
          iconBg: "bg-emerald-500/10 border-emerald-500/20",
          button: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20",
        };
      case "primary":
      default:
        return {
          icon: <RotateCcw className="w-6 h-6 text-gold-main" />,
          iconBg: "bg-gold-main/10 border-gold-main/20",
          button: "bg-gold-main hover:bg-gold-hover text-white shadow-gold-main/20",
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border-subtle w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${style.iconBg} shrink-0`}>
            {style.icon}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border-subtle/80">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors text-xs font-semibold"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg scale-[1.01] ${style.button}`}
          >
            {loading ? "Processando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
