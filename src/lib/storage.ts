import type { Registro } from "./analysis";

const KEY = "sertaotech-registros";

export function carregarRegistros(): Registro[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Registro[]) : [];
  } catch {
    return [];
  }
}

export function salvarRegistros(registros: Registro[]) {
  window.localStorage.setItem(KEY, JSON.stringify(registros));
}
