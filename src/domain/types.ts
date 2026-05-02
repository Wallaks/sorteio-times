/**
 * Modelos de domínio — ver docs/features (F-001 … F-004).
 */

/** Jogador na lista interna. */
export interface Player {
  name: string;
  canGK: boolean;
}

/** Linha interpretada na importação. */
export interface ParsedImportLine {
  name: string;
  canGK: boolean;
}

export interface DrawConfig {
  listaMax: number;
  nPerTeam: number;
}

export interface DrawGkPick {
  player: Player | null;
  fromVolunteers: boolean;
}

/** Resultado completo do sorteio Fut7 (2 times). */
export interface Fut7DrawResult {
  listaMax: number;
  nPerTeam: number;
  /** Ordem dos jogadores de linha após embaralho. */
  listaOrder: Player[];
  naLista: Player[];
  foraLista: Player[];
  teamA: Player[];
  teamB: Player[];
  gkA: DrawGkPick;
  gkB: DrawGkPick;
  /** Reservas de linha (após os titulares do jogo). */
  reservas: Player[];
  titularesTotal: number;
  warnings: string[];
}
