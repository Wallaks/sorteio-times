/**
 * Formatação do resultado para colar no WhatsApp.
 * @see docs/features/F-004-exportar-whatsapp.md
 */

import type { Fut7DrawResult, Player } from "./types";

export class WhatsAppExporter {
  static buildShareText(r: Fut7DrawResult): string {
    const lines: string[] = [];
    lines.push("⚽ *Pelada — Sorteio de Times*");
    lines.push("");
    lines.push(`*Lista (1–${r.naLista.length})*`);
    r.naLista.forEach((p: Player, i: number) => {
      lines.push(`${i + 1}. ${p.name}${p.canGK ? " (gol)" : ""}`);
    });
    lines.push("");
    lines.push("*Time A*");
    lines.push(r.gkA.player ? `Goleiro: ${r.gkA.player.name}` : "Goleiro: a combinar");
    r.teamA.forEach((p, i) => lines.push(`${i + 1}. ${p.name}`));
    lines.push("");
    lines.push("*Time B*");
    lines.push(r.gkB.player ? `Goleiro: ${r.gkB.player.name}` : "Goleiro: a combinar");
    r.teamB.forEach((p, i) => lines.push(`${i + 1}. ${p.name}`));
    if (r.reservas.length) {
      lines.push("");
      lines.push("*Reservas*");
      r.reservas.forEach((p, i) => lines.push(`${i + 1}. ${p.name}`));
    }
    if (r.foraLista.length) {
      lines.push("");
      lines.push(`*Supletes (fora da lista de ${r.listaMax})*`);
      r.foraLista.forEach((p) => lines.push(`• ${p.name}`));
    }
    lines.push("");
    lines.push("_Bola 19h_ ⚽");
    return lines.join("\n");
  }
}
