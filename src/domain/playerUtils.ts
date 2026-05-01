import type { ParsedImportLine, Player } from "./types";

export function nameKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function clampStars(n: number | string): number {
  const x = typeof n === "string" ? parseInt(n, 10) : n;
  if (!Number.isFinite(x)) return 3;
  return Math.min(5, Math.max(1, x));
}

export function normalizePlayer(p: Partial<Player> & { name?: string }): Player {
  return {
    name: String(p.name ?? "").trim(),
    canGK: !!p.canGK,
    stars: clampStars(p.stars ?? 3),
  };
}

/** Converte linha importada em jogador com estrelas padrão quando ausentes. */
export function toPlayer(
  line: ParsedImportLine,
  defaultStars: number
): Player {
  return normalizePlayer({
    name: line.name,
    canGK: line.canGK,
    stars: line.stars != null ? line.stars : defaultStars,
  });
}

export function starLabel(n: number): string {
  return `⭐${String(n)}`;
}
