import type { Player } from "../domain/types";
import { normalizePlayer } from "../domain/playerUtils";

const STORAGE_KEY = "pelada-fut7-v4";

export interface PeladaPersistedPayload {
  players: Player[];
  listaMax: string;
  perTeam: string;
  balanceByStars: boolean;
}

export class PeladaStorage {
  constructor(private readonly key: string = STORAGE_KEY) {}

  load(): Partial<PeladaPersistedPayload> | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const data = JSON.parse(raw) as Partial<PeladaPersistedPayload>;
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

  save(payload: PeladaPersistedPayload): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(payload));
    } catch {
      /* ignore quota / private mode */
    }
  }
}
