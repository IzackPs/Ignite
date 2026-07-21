import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = "max-w-md" }: Readonly<ModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-surface border border-border-subtle w-full ${maxWidth} rounded-2xl shadow-2xl p-6 relative space-y-4`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {description && (
            <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
