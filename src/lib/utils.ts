import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(val: number): string {
  if (Number.isNaN(val) || val === undefined || val === null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

export function formatPercent(val: number, decimals: number = 2): string {
  if (Number.isNaN(val) || val === undefined || val === null) return "0,00%";
  return `${val.toFixed(decimals).replace(".", ",")}%`;
}

export function formatNumber(val: number, decimals: number = 2): string {
  if (Number.isNaN(val) || val === undefined || val === null) return "0";
  return val.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function getTodayLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

