/** Texto do modelo de lista para colar no WhatsApp (organizador). */

function nLines(from: number, to: number): string {
  const a: string[] = [];
  for (let i = from; i <= to; i++) a.push(`${i}.`);
  return a.join("\n");
}

export const LISTA_TEMPLATE_WHATSAPP: string =
  "⚽ *Lista Pelada - 19h*\n" +
  "_Não modifique a estrutura da lista._\n\n" +
  "[campo]\n" +
  nLines(1, 18) +
  "\n\n" +
  "[goleiros]\n" +
  "1.\n" +
  "2.\n\n" +
  "[supletes]\n" +
  nLines(1, 5);
