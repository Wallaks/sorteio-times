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
    if (r.gkA.player) lines.push(`Goleiro: ${r.gkA.player.name}`);
    r.teamA.forEach((p) => lines.push(`• ${p.name}`));
    lines.push("");
    lines.push("*Time B*");
    if (r.gkB.player) lines.push(`Goleiro: ${r.gkB.player.name}`);
    r.teamB.forEach((p) => lines.push(`• ${p.name}`));
    if (r.reservas.length) {
      lines.push("");
      lines.push("*Reservas*");
      r.reservas.forEach((p) => lines.push(`• ${p.name}`));
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
