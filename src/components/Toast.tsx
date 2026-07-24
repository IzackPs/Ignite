"use client";

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export interface ToastProps {
  readonly message: string;
  readonly type?: "info" | "warning" | "success" | "error";
  readonly onClose: () => void;
  readonly duration?: number;
}

export function Toast({ message, type = "warning", onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-gold-main flex-shrink-0" />,
  };

  const bgStyles = {
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
    error: "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
    info: "border-gold-main/30 bg-gold-main/10 text-blue-900 dark:text-blue-200",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs sm:text-sm font-medium max-w-md ${bgStyles[type]}`}
      >
        {icons[type]}
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
