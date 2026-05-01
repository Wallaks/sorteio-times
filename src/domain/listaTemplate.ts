/** Texto do modelo de lista para colar no WhatsApp (organizador). */

function nLines(from: number, to: number): string {
  const a: string[] = [];
  for (let i = from; i <= to; i++) a.push(`${i}.`);
  return a.join("\n");
}

export const LISTA_TEMPLATE_WHATSAPP: string =
  "⚽ *PELADA FUT7 — LISTA*\n\n" +
  "_Copiem → coloquem o nome depois do número → mandem de volta no grupo._\n\n" +
  "[campo]\n" +
  nLines(1, 18) +
  "\n\n" +
  "[goleiros]\n" +
  "1.\n" +
  "2.\n\n" +
  "[supletes]\n" +
  nLines(1, 8) +
  "\n" +
  "(sem limite: se precisar, acrescentem 9. 10. 11. … embaixo)\n\n" +
  "_Opcional: *1 a *5 no fim do nome (equilibrar times)._";
