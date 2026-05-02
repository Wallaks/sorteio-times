/**
 * Sorteio Fut7 — sorteia jogadores de linha em dois times.
 * Goleiros são separados do sorteio: se inscritos, sempre começam jogando.
 * @see docs/features/F-002-sorteio-times.md
 */

import type { DrawConfig, DrawGkPick, Fut7DrawResult, Player } from "./types";
import { normalizePlayer } from "./playerUtils";
import { shuffle } from "./random";

export class Fut7DrawEngine {
  draw(players: readonly Player[], config: DrawConfig): Fut7DrawResult {
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
    if (goalkeepers.length === 0 && titulares.length >= 2) {
      warnings.push("Sem goleiros na lista — combinem entre os de fora quem vai no gol.");
    } else if (goalkeepers.length === 1 && titulares.length >= 2) {
      warnings.push("Só um goleiro na lista — o outro time tira o gol entre quem ficou de fora.");
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
