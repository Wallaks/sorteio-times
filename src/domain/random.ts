import type { Player } from "./types";

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pickRandom<T>(arr: readonly T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function sumStars(players: readonly Player[]): number {
  let s = 0;
  for (const p of players) s += p.stars;
  return s;
}
