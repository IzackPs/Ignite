"use client";
import React from "react";

import { useState, useEffect, useRef } from 'react';
import { Modal } from "@/components/ui/Modal";
import { Camera, Upload, Trash2, User as UserIcon, Link as LinkIcon } from "lucide-react";

interface UserAvatarModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentImage?: string | null;
  readonly userName?: string;
  readonly onSave: (newImage: string | null) => void;
}

export function UserAvatarModal({
  isOpen,
  onClose,
  currentImage,
  userName = "Investidor",
  onSave,
}: UserAvatarModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageUrl(currentImage || "");
    setError(null);
  }, [currentImage, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamanho da imagem (máx 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setError("A imagem deve ser menor que 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl.trim() || null }),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar foto de perfil");
      }

      onSave(imageUrl.trim() || null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Falha ao salvar avatar");
    } finally {
      setSaving(false);
    }
  };

  const initials = userName.charAt(0).toUpperCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Foto de Perfil" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Live Preview & Change Button */}
        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-gold-main flex items-center justify-center overflow-hidden shadow-xl shadow-gold-main/20">
              {imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("data:image")) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={userName}
                  className="w-full h-full object-cover"
                  onError={() => setError("Não foi possível carregar a imagem selecionada")}
                />
              ) : (
                <span className="text-4xl font-black text-gold-main font-mono">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-gold-main hover:bg-gold-hover text-white rounded-full shadow-lg transition-transform hover:scale-110"
              title="Carregar Imagem do Dispositivo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 text-center">
            Clique na câmera para fazer upload da foto no seu dispositivo
          </p>
        </div>

        {/* Input de Upload de Arquivo Escondido */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Área de Botões de Ação de Upload */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Upload className="w-4 h-4 text-gold-main" />
            <span>Enviar Imagem</span>
          </button>

          {imageUrl ? (
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="flex items-center justify-center gap-2 p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remover Foto</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-xs text-zinc-500">
              <UserIcon className="w-4 h-4 text-gold-main" />
              <span>Usando Inicial ({initials})</span>
            </div>
          )}
        </div>

        {/* Opcional: Colar URL de Imagem da Web */}
        <div className="space-y-1.5 pt-2 border-t border-border-subtle">
          <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
            Ou cole um link direto da imagem:
          </label>
          <input
            type="url"
            value={imageUrl.startsWith("data:image") ? "" : imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://exemplo.com/sua-foto.jpg"
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-main"
          />
        </div>

        {/* Rodapé com Salvar e Cancelar */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-900 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-bold bg-gold-main hover:bg-gold-hover text-white rounded-xl transition-all shadow-md shadow-gold-main/20 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Foto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
