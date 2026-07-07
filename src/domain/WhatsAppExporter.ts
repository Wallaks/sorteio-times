/**
 * Formatação do resultado para colar no WhatsApp.
 */

import type { DrawResult } from "./types";

export class WhatsAppExporter {
  static buildShareText(r: DrawResult): string {
    const hasGk = !!(r.gkA.player || r.gkB.player);
    const lines: string[] = [];
    lines.push("*Sorteio de Times*");
    lines.push("");
    lines.push("*Time Azul*");
    if (hasGk) lines.push(r.gkA.player ? `Goleiro: ${r.gkA.player.name}` : "Goleiro: a combinar");
    r.teamA.forEach((p, i) => lines.push(`${i + 1}. ${p.name}`));
    lines.push("");
    lines.push("*Time Vermelho*");
    if (hasGk) lines.push(r.gkB.player ? `Goleiro: ${r.gkB.player.name}` : "Goleiro: a combinar");
    r.teamB.forEach((p, i) => lines.push(`${i + 1}. ${p.name}`));
    if (r.reservas.length) {
      lines.push("");
      lines.push("*Reservas / 3º time*");
      r.reservas.forEach((p, i) => lines.push(`${i + 1}. ${p.name}`));
    }
    return lines.join("\n");
  }
}
