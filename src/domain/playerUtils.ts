import type { Player } from "./types";

export function nameKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export function normalizePlayer(p: Partial<Player> & { name?: string }): Player {
  return {
    name: String(p.name ?? "").trim(),
    canGK: !!p.canGK,
  };
}
