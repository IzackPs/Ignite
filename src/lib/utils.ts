import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(val: number): string {
  if (isNaN(val) || val === undefined || val === null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

export function formatPercent(val: number, decimals: number = 2): string {
  if (isNaN(val) || val === undefined || val === null) return "0,00%";
  return `${val.toFixed(decimals).replace(".", ",")}%`;
}

export function formatNumber(val: number, decimals: number = 2): string {
  if (isNaN(val) || val === undefined || val === null) return "0";
  return val.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
