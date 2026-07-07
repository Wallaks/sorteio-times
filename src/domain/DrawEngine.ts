/**
 * Sorteio — divide os jogadores de linha em dois times.
 * Goleiros são separados do sorteio: se marcados, sempre começam jogando (1 por time).
 */

import type { DrawConfig, DrawGkPick, DrawResult, Player } from "./types";
import { normalizePlayer } from "./playerUtils";
import { shuffle } from "./random";

export class DrawEngine {
  draw(players: readonly Player[], config: DrawConfig): DrawResult {
    const listaMax = config.listaMax;
    const nPerTeam = config.nPerTeam;
    const titularesTotal = nPerTeam * 2;

    const normalized = players.map((p) => normalizePlayer(p));
    const fieldPlayers = normalized.filter((p) => !p.canGK);
    const goalkeepers = normalized.filter((p) => p.canGK);

    const fieldOrder = shuffle(fieldPlayers);
    const naLista = fieldOrder.slice(0, Math.min(listaMax, fieldOrder.length));
    const foraLista = fieldOrder.slice(listaMax);

    const titulares = naLista.slice(0, Math.min(titularesTotal, naLista.length));
    const teamA: Player[] = [];
    const teamB: Player[] = [];
    titulares.forEach((p, i) => {
      if (i % 2 === 0) teamA.push(p);
      else teamB.push(p);
    });
    const reservas = naLista.slice(titularesTotal);

    const shuffledGks = shuffle(goalkeepers);
    const gkA: DrawGkPick = shuffledGks[0]
      ? { player: shuffledGks[0], fromVolunteers: true }
      : { player: null, fromVolunteers: false };
    const gkB: DrawGkPick = shuffledGks[1]
      ? { player: shuffledGks[1], fromVolunteers: true }
      : { player: null, fromVolunteers: false };

    const warnings: string[] = [];
    if (goalkeepers.length === 1 && titulares.length >= 2) {
      warnings.push("Só um goleiro marcado — o outro time combina o gol entre quem ficou de fora.");
    } else if (goalkeepers.length > 2) {
      const sobrando = goalkeepers.length - 2;
      warnings.push(
        `${goalkeepers.length} goleiros marcados — só 2 entram no sorteio (1 por time). ${sobrando} ${sobrando === 1 ? "ficou" : "ficaram"} de fora.`
      );
    }
    if (titulares.length < titularesTotal) {
      warnings.push(
        `Titulares de linha: ${titulares.length}/${titularesTotal} — dá pra jogar com menos ou esperar chegada.`
      );
    }

    return {
      listaMax,
      nPerTeam,
      listaOrder: fieldOrder,
      naLista,
      foraLista,
      teamA,
      teamB,
      gkA,
      gkB,
      reservas,
      titularesTotal,
      warnings,
    };
  }
}
