/**
 * Sorteio Fut7 — dois times, goleiros, equilíbrio opcional por estrelas.
 * @see docs/features/F-002-sorteio-times.md
 */

import type { DrawConfig, DrawGkPick, Fut7DrawResult, Player } from "./types";
import { normalizePlayer } from "./playerUtils";
import { pickRandom, shuffle, sumStars } from "./random";

export class Fut7DrawEngine {
  draw(players: readonly Player[], config: DrawConfig): Fut7DrawResult {
    const listaMax = config.listaMax;
    const nPerTeam = config.nPerTeam;
    const balance = config.balanceByStars;
    const titularesTotal = nPerTeam * 2;

    const listaOrder = shuffle(players.map((p) => normalizePlayer(p)));
    const warnings: string[] = [];

    const naLista = listaOrder.slice(0, Math.min(listaMax, listaOrder.length));
    const foraLista = listaOrder.slice(listaMax);

    const titularPlayers = listaOrder.slice(0, Math.min(titularesTotal, listaOrder.length));
    let teamA: Player[];
    let teamB: Player[];
    let sumA: number;
    let sumB: number;

    if (balance && titularPlayers.length > 0) {
      const sp = Fut7DrawEngine.splitTitularesBalanced(titularPlayers);
      teamA = sp.teamA;
      teamB = sp.teamB;
      sumA = sp.sumA;
      sumB = sp.sumB;
    } else {
      teamA = [];
      teamB = [];
      titularPlayers.forEach((p, i) => {
        if (i % 2 === 0) teamA.push(p);
        else teamB.push(p);
      });
      sumA = sumStars(teamA);
      sumB = sumStars(teamB);
    }

    const gkA = Fut7DrawEngine.assignGk(teamA, "A", warnings);
    const gkB = Fut7DrawEngine.assignGk(teamB, "B", warnings);

    const volunteersTotal = players.filter((p) => p.canGK).length;
    if (volunteersTotal === 0 && titularPlayers.length >= 2) {
      warnings.push(
        "Ninguém marcou goleiro: o app sorteou um nome por time só pra referência — combinem antes."
      );
    } else if (volunteersTotal === 1 && titularPlayers.length >= 2) {
      warnings.push("Só há um voluntário de gol no grupo — combinem segundo goleiro ou rodízio.");
    }

    if (titularPlayers.length < titularesTotal) {
      warnings.push(
        `Titulares: ${titularPlayers.length}/${titularesTotal} — dá pra jogar com menos ou esperar chegada.`
      );
    }

    const reservas = naLista.slice(titularesTotal);

    return {
      listaMax,
      nPerTeam,
      balance,
      listaOrder,
      naLista,
      foraLista,
      teamA,
      teamB,
      sumA,
      sumB,
      gkA,
      gkB,
      reservas,
      titularesTotal,
      warnings,
    };
  }

  private static splitTitularesBalanced(titularPlayers: readonly Player[]): {
    teamA: Player[];
    teamB: Player[];
    sumA: number;
    sumB: number;
  } {
    const pool = shuffle(titularPlayers.slice());
    pool.sort((a, b) => b.stars - a.stars);
    const teamA: Player[] = [];
    const teamB: Player[] = [];
    let sumA = 0;
    let sumB = 0;
    for (const p of pool) {
      if (sumA <= sumB) {
        teamA.push(p);
        sumA += p.stars;
      } else {
        teamB.push(p);
        sumB += p.stars;
      }
    }
    return { teamA, teamB, sumA, sumB };
  }

  private static assignGk(
    team: readonly Player[],
    label: string,
    warnings: string[]
  ): DrawGkPick {
    const volunteers = team.filter((p) => p.canGK);
    const chosen = pickRandom(volunteers);
    if (chosen) return { player: chosen, fromVolunteers: true };
    if (team.length) {
      warnings.push(
        `Time "${label}": ninguém marcou "gol". Combinem no grupo quem fecha (ou rodízio).`
      );
      return { player: pickRandom([...team]), fromVolunteers: false };
    }
    return { player: null, fromVolunteers: false };
  }
}
