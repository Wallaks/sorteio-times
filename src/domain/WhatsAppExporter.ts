/**
 * Formatação do resultado para colar no WhatsApp.
 * @see docs/features/F-004-exportar-whatsapp.md
 */

import { starLabel } from "./playerUtils";
import type { Fut7DrawResult, Player } from "./types";

export class WhatsAppExporter {
  static buildShareText(r: Fut7DrawResult): string {
    const lines: string[] = [];
    lines.push("⚽ *Pelada Fut7 — sorteio*");
    lines.push("");
    lines.push(`*Lista (1–${r.naLista.length})*`);
    r.naLista.forEach((p: Player, i: number) => {
      lines.push(
        `${i + 1}. ${p.name} ${starLabel(p.stars)}${p.canGK ? " (gol)" : ""}`
      );
    });
    lines.push("");
    lines.push(`*Time A*${r.balance ? ` · ⭐ ${r.sumA}` : ""}`);
    if (r.gkA.player) lines.push(`Goleiro: ${r.gkA.player.name}`);
    r.teamA.forEach((p) => lines.push(`• ${p.name} ${starLabel(p.stars)}`));
    lines.push("");
    lines.push(`*Time B*${r.balance ? ` · ⭐ ${r.sumB}` : ""}`);
    if (r.gkB.player) lines.push(`Goleiro: ${r.gkB.player.name}`);
    r.teamB.forEach((p) => lines.push(`• ${p.name} ${starLabel(p.stars)}`));
    if (r.reservas.length) {
      lines.push("");
      lines.push("*Reservas da lista*");
      r.reservas.forEach((p) => lines.push(`• ${p.name} ${starLabel(p.stars)}`));
    }
    if (r.foraLista.length) {
      lines.push("");
      lines.push(`*Supletes (fora da lista de ${r.listaMax})*`);
      r.foraLista.forEach((p) => lines.push(`• ${p.name} ${starLabel(p.stars)}`));
    }
    lines.push("");
    lines.push("_Sorteio no app — bola 19h_");
    return lines.join("\n");
  }
}
