/**
 * Modelos de domínio — ver docs/features (F-001 … F-004).
 */

/** Jogador na lista interna (sempre com estrelas 1–5). */
export interface Player {
  name: string;
  canGK: boolean;
  stars: number;
}

/** Linha interpretada na importação (estrelas opcionais até normalizar). */
export interface ParsedImportLine {
  name: string;
  canGK: boolean;
  stars: number | null;
}

export interface DrawConfig {
  listaMax: number;
  nPerTeam: number;
  balanceByStars: boolean;
}

export interface DrawGkPick {
  player: Player | null;
  fromVolunteers: boolean;
}

/** Resultado completo do sorteio Fut7 (2 times). */
export interface Fut7DrawResult {
  listaMax: number;
  nPerTeam: number;
  balance: boolean;
  /** Ordem global após embaralho (base para lista e titulares). */
  listaOrder: Player[];
  naLista: Player[];
  foraLista: Player[];
  teamA: Player[];
  teamB: Player[];
  sumA: number;
  sumB: number;
  gkA: DrawGkPick;
  gkB: DrawGkPick;
  /** Reservas na lista numerada (após os titulares do jogo). */
  reservas: Player[];
  titularesTotal: number;
  warnings: string[];
}
