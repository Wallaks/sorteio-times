import type { Player } from "../domain/types";
import { normalizePlayer } from "../domain/playerUtils";

const STORAGE_KEY = "sorteio-times-v1";

export interface StoredState {
  players: Player[];
  perTeam: string;
}

export class TeamsStorage {
  constructor(private readonly key: string = STORAGE_KEY) {}

  load(): Partial<StoredState> | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const data = JSON.parse(raw) as Partial<StoredState>;
      if (Array.isArray(data.players)) {
        data.players = data.players
          .map((p) => normalizePlayer(p))
          .filter((p) => p.name.length > 0);
      }
      return data;
    } catch {
      return null;
    }
  }

  save(payload: StoredState): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(payload));
    } catch {
      /* ignore quota / private mode */
    }
  }
}
