/**
 * QA manual — exercita ListParser, Fut7DrawEngine e WhatsAppExporter.
 * Rodar com: npx tsx tests/qa.ts
 */

import { ListParser } from "../src/domain/ListParser";
import { Fut7DrawEngine } from "../src/domain/Fut7DrawEngine";
import { WhatsAppExporter } from "../src/domain/WhatsAppExporter";
import { LISTA_TEMPLATE_WHATSAPP } from "../src/domain/listaTemplate";

let passed = 0;
let failed = 0;

function ok(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// ─── 1. ListParser: template preenchido com 18 campo + 2 goleiros ────────────
console.log("\n[1] Import: template completo (18 campo + 2 goleiros)");

const templatePreenchido = `⚽ *Lista Pelada - 19h*
_Não modifique a estrutura da lista._

[campo]
1. João
2. Pedro
3. Carlos
4. Marcos
5. Felipe
6. Rafael
7. Bruno
8. Lucas
9. Gustavo
10. Diego
11. Thiago
12. André
13. Rodrigo
14. Mateus
15. Paulo
16. Victor
17. Fernando
18. Alexandre

[goleiros]
1. Leandro
2. Sergio

[supletes]
1. Igor
2. Renato
3.
4.
5.`;

const r1 = ListParser.parse(templatePreenchido);
const names1 = r1.map((p) => p.name);

ok("Título não vira jogador", !names1.includes("⚽ *Lista Pelada - 19h*") && !names1.some(n => n.includes("Lista Pelada")));
ok("Instrução não vira jogador", !names1.some(n => n.includes("Não modifique")));
ok("18 jogadores de campo importados", r1.filter((p) => !p.canGK).length === 18, `got ${r1.filter(p => !p.canGK).length}`);
ok("2 goleiros importados", r1.filter((p) => p.canGK).length === 2, `got ${r1.filter(p => p.canGK).length}`);
ok("Supletes ignorados (Igor e Renato fora)", !names1.includes("Igor") && !names1.includes("Renato"));
ok("Total 20 jogadores (18 campo + 2 gol)", r1.length === 20, `got ${r1.length}`);
ok("Primeiro jogador é João", r1[0]?.name === "João");
ok("Leandro marcado como goleiro", r1.find(p => p.name === "Leandro")?.canGK === true);
ok("Importado não tem campo 'stars'", !("stars" in (r1[0] ?? {})));

// ─── 2. ListParser: lista curta sem goleiro ───────────────────────────────────
console.log("\n[2] Import: 12 jogadores, sem goleiro");

const listaMinima = `[campo]
1. Ana
2. Bia
3. Clara
4. Dani
5. Eva
6. Fabi
7. Gabi
8. Helena
9. Iris
10. Julia
11. Karen
12. Laura

[goleiros]
1.
2.

[supletes]
1.`;

const r2 = ListParser.parse(listaMinima);
ok("12 jogadores importados", r2.length === 12, `got ${r2.length}`);
ok("Nenhum goleiro (slots vazios ignorados)", r2.filter((p) => p.canGK).length === 0);
ok("Supletes ignorados (slot vazio)", r2.length === 12);

// ─── 3. ListParser: lista plana (um nome por linha) ──────────────────────────
console.log("\n[3] Import: lista plana sem seções");

const listaPlana = `Zico
Pelé
Ronaldo
Ronaldinho
Kaká
Neymar`;

const r3 = ListParser.parse(listaPlana);
ok("6 jogadores da lista plana", r3.length === 6, `got ${r3.length}`);
ok("Nome 'Zico' presente", r3.some(p => p.name === "Zico"));

// ─── 4. ListParser: nomes com markdown WhatsApp ──────────────────────────────
console.log("\n[4] Import: nomes com negrito/itálico do WhatsApp");

const listaMarkdown = `[campo]
1. *João Silva*
2. _Pedro_ Santos
3. Carlos

[goleiros]
1. *Leandro*`;

const r4 = ListParser.parse(listaMarkdown);
ok("Asteriscos removidos do nome", r4[0]?.name === "João Silva", `got "${r4[0]?.name}"`);
ok("Underscores removidos do nome", r4[1]?.name === "Pedro Santos", `got "${r4[1]?.name}"`);
ok("Nome sem markdown intacto", r4[2]?.name === "Carlos");
ok("Goleiro com markdown limpo", r4[3]?.name === "Leandro" && r4[3]?.canGK === true);

// ─── 4b. ListParser: lista do tipo "Lista do Fut" do WhatsApp ───────────────
console.log("\n[4b] Import: formato 'Lista do Fut' (sem colchetes)");

const listaDoFut = `Lista do Fut
1. Tiago
2. Felipe
3. Bruno

Goleiros:
1. Mario
2. Paulo

Suplentes
1. Caio
2. Junior`;

const r4b = ListParser.parse(listaDoFut);
ok("3 de linha + 2 goleiros = 5", r4b.length === 5, `got ${r4b.length}`);
ok("Goleiros marcados", r4b.filter(p => p.canGK).length === 2);
ok("Suplentes ignorados (Caio/Junior fora)",
  !r4b.some(p => p.name === "Caio") && !r4b.some(p => p.name === "Junior"));

// ─── 4c. ListParser: nome com (gol) inline ──────────────────────────────────
console.log("\n[4c] Import: marcador (gol) inline");

const listaInline = `[campo]
1. Henrique (gol)
2. Marcos`;

const r4c = ListParser.parse(listaInline);
ok("Henrique marcado como goleiro pelo (gol)", r4c.find(p => p.name === "Henrique")?.canGK === true);
ok("Marcos NÃO é goleiro", r4c.find(p => p.name === "Marcos")?.canGK === false);

// ─── 4d. ListParser: linhas com instruções/separadores não viram jogadores ──
console.log("\n[4d] Import: filtros de instrução");

const listaComInstrucao = `_Copiem a lista, preencham e mandem de volta._
[campo]
1. Junior
2. Paulo
———
[goleiros]
1.`;

const r4d = ListParser.parse(listaComInstrucao);
ok("Instrução 'Copiem' não vira jogador",
  !r4d.some(p => p.name.toLowerCase().includes("copiem")));
ok("Separador '———' não vira jogador", !r4d.some(p => p.name === "———" || p.name.includes("—")));
ok("2 jogadores extraídos", r4d.length === 2);

// ─── 5. DrawEngine: 12 campo + 2 goleiros, 6 por time (caso ideal) ───────────
console.log("\n[5] Draw: 12 jogadores de linha + 2 goleiros, 6 por time");

const cenario12mais2 = [
  ...Array.from({ length: 12 }, (_, i) => ({ name: `Linha${i + 1}`, canGK: false })),
  { name: "GK1", canGK: true },
  { name: "GK2", canGK: true },
];

const engine = new Fut7DrawEngine();
const d5 = engine.draw(cenario12mais2, { listaMax: 18, nPerTeam: 6 });

ok("naLista é só campo (12 jogadores)", d5.naLista.length === 12, `got ${d5.naLista.length}`);
ok("naLista não contém goleiros", d5.naLista.every(p => !p.canGK));
ok("Time A com 6 de linha", d5.teamA.length === 6, `got ${d5.teamA.length}`);
ok("Time B com 6 de linha", d5.teamB.length === 6, `got ${d5.teamB.length}`);
ok("Times só têm jogadores de linha", d5.teamA.every(p => !p.canGK) && d5.teamB.every(p => !p.canGK));
ok("Goleiro A atribuído (voluntário)", d5.gkA.player !== null && d5.gkA.fromVolunteers);
ok("Goleiro B atribuído (voluntário)", d5.gkB.player !== null && d5.gkB.fromVolunteers);
ok("Goleiros são distintos", d5.gkA.player?.name !== d5.gkB.player?.name);
ok("Goleiros são GK1 e GK2", [d5.gkA.player?.name, d5.gkB.player?.name].sort().join(",") === "GK1,GK2");
ok("Sem reservas (12 = titulares totais)", d5.reservas.length === 0);
ok("Sem supletes", d5.foraLista.length === 0);
ok("Sem warnings", d5.warnings.length === 0, `warnings: ${d5.warnings.join("; ")}`);

// invariância: 50 sorteios, goleiros sempre saem dos voluntários, sempre 6+6
let invariantOk = true;
for (let i = 0; i < 50; i++) {
  const dx = engine.draw(cenario12mais2, { listaMax: 18, nPerTeam: 6 });
  if (dx.teamA.length !== 6 || dx.teamB.length !== 6) invariantOk = false;
  if (dx.gkA.player === null || dx.gkB.player === null) invariantOk = false;
  if (!dx.gkA.fromVolunteers || !dx.gkB.fromVolunteers) invariantOk = false;
  if (dx.gkA.player?.name === dx.gkB.player?.name) invariantOk = false;
  if (dx.teamA.some(p => p.canGK) || dx.teamB.some(p => p.canGK)) invariantOk = false;
}
ok("Invariante em 50 sorteios (6+6, goleiros distintos e voluntários)", invariantOk);

// ─── 6. DrawEngine: 12 campo, 0 goleiros, 6 por time ─────────────────────────
console.log("\n[6] Draw: 12 jogadores de linha, sem goleiro");

const cenario12sem = Array.from({ length: 12 }, (_, i) => ({
  name: `Player${i + 1}`,
  canGK: false,
}));

const d6 = engine.draw(cenario12sem, { listaMax: 18, nPerTeam: 6 });

ok("12 na lista", d6.naLista.length === 12);
ok("Time A com 6", d6.teamA.length === 6);
ok("Time B com 6", d6.teamB.length === 6);
ok("Goleiro A nulo", d6.gkA.player === null);
ok("Goleiro B nulo", d6.gkB.player === null);
ok("Warning de sem goleiro", d6.warnings.some(w => w.includes("Sem goleiros")));

// ─── 7. DrawEngine: 12 campo + 1 goleiro (caso 1 GK) ─────────────────────────
console.log("\n[7] Draw: 12 jogadores de linha + 1 goleiro, 6 por time");

const cenario12mais1 = [
  ...Array.from({ length: 12 }, (_, i) => ({ name: `L${i + 1}`, canGK: false })),
  { name: "GoleiroÚnico", canGK: true },
];

const d7 = engine.draw(cenario12mais1, { listaMax: 18, nPerTeam: 6 });

ok("Time A com 6 de linha", d7.teamA.length === 6);
ok("Time B com 6 de linha", d7.teamB.length === 6);
ok("Apenas um time tem goleiro voluntário",
  (d7.gkA.player !== null) !== (d7.gkB.player !== null),
  `gkA=${d7.gkA.player?.name}, gkB=${d7.gkB.player?.name}`);
ok("Goleiro é o GoleiroÚnico", d7.gkA.player?.name === "GoleiroÚnico" || d7.gkB.player?.name === "GoleiroÚnico");
ok("Warning de só um goleiro", d7.warnings.some(w => w.includes("Só um goleiro")));

// ─── 7b. DrawEngine: 12 campo + 3 goleiros (excesso) ────────────────────────
console.log("\n[7b] Draw: 12 jogadores de linha + 3 goleiros (excesso)");

const cenario12mais3 = [
  ...Array.from({ length: 12 }, (_, i) => ({ name: `L${i + 1}`, canGK: false })),
  { name: "GK1", canGK: true },
  { name: "GK2", canGK: true },
  { name: "GK3", canGK: true },
];

const d7b = engine.draw(cenario12mais3, { listaMax: 18, nPerTeam: 6 });

ok("Time A com 6 de linha", d7b.teamA.length === 6);
ok("Time B com 6 de linha", d7b.teamB.length === 6);
ok("Goleiro A atribuído", d7b.gkA.player !== null);
ok("Goleiro B atribuído", d7b.gkB.player !== null);
ok("Goleiros A e B são distintos", d7b.gkA.player?.name !== d7b.gkB.player?.name);
ok("Warning de excesso (3 inscritos, 1 fora)", d7b.warnings.some(w => w.includes("3 goleiros") && w.includes("1 ficou")));

// ─── 8. DrawEngine: 10 campo, 6 por time (titulares incompletos) ─────────────
console.log("\n[8] Draw: 10 jogadores, 6 por time (titulares incompletos)");

const jogadores10 = Array.from({ length: 10 }, (_, i) => ({
  name: `P${i + 1}`,
  canGK: false,
}));

const d8 = engine.draw(jogadores10, { listaMax: 18, nPerTeam: 6 });

ok("10 na lista (não 18)", d8.naLista.length === 10);
ok("Time A com 5 (alternado)", d8.teamA.length === 5, `got ${d8.teamA.length}`);
ok("Time B com 5", d8.teamB.length === 5, `got ${d8.teamB.length}`);
ok("Warning de titulares incompletos", d8.warnings.some(w => w.includes("Titulares")));

// ─── 9. DrawEngine: 18 campo + 2 GK, 6 por time (6 reservas de linha) ────────
console.log("\n[9] Draw: 18 campo + 2 goleiros, 6 por time → 6 reservas");

const cenario18mais2 = [
  ...Array.from({ length: 18 }, (_, i) => ({ name: `J${i + 1}`, canGK: false })),
  { name: "G1", canGK: true },
  { name: "G2", canGK: true },
];

const d9 = engine.draw(cenario18mais2, { listaMax: 18, nPerTeam: 6 });

ok("18 de linha na lista", d9.naLista.length === 18);
ok("Time A com 6", d9.teamA.length === 6);
ok("Time B com 6", d9.teamB.length === 6);
ok("6 reservas de linha (18 - 12)", d9.reservas.length === 6, `got ${d9.reservas.length}`);
ok("Sem supletes (todos cabem em 18)", d9.foraLista.length === 0);
ok("Goleiros sempre jogam (não estão em reservas)", d9.reservas.every(p => !p.canGK));
ok("Goleiros sempre jogam (não estão em foraLista)", d9.foraLista.every(p => !p.canGK));

// ─── 10. DrawEngine: 20 inscritos de linha, lista máx 18 (2 supletes) ────────
console.log("\n[10] Draw: 20 de linha, listaMax 18 (2 supletes)");

const jogadores20 = Array.from({ length: 20 }, (_, i) => ({
  name: `X${i + 1}`,
  canGK: false,
}));

const d10 = engine.draw(jogadores20, { listaMax: 18, nPerTeam: 6 });

ok("18 na lista (cortados em listaMax)", d10.naLista.length === 18);
ok("2 supletes (fora da lista)", d10.foraLista.length === 2, `got ${d10.foraLista.length}`);
ok("6 reservas na lista", d10.reservas.length === 6);

// ─── 11. WhatsAppExporter ─────────────────────────────────────────────────────
console.log("\n[11] WhatsAppExporter: formato do texto gerado");

const txt = WhatsAppExporter.buildShareText(d9);
ok("Contém título", txt.includes("Pelada — Sorteio de Times"));
ok("Contém Colete Azul", txt.includes("*Colete Azul*"));
ok("Contém Colete Vermelho", txt.includes("*Colete Vermelho*"));
ok("Não contém os antigos 'Time A/B'", !txt.includes("*Time A*") && !txt.includes("*Time B*"));
ok("Contém numeração 1.", txt.includes("1."));
ok("Contém numeração 6. (último do time)", txt.includes("6."));
ok("Contém Goleiro: nos times", (txt.match(/Goleiro:/g) ?? []).length >= 2);
ok("Contém Reservas", txt.includes("*Reservas*"));
ok("Não contém estrelas", !txt.includes("⭐") && !txt.includes("★") && !txt.includes("*1") && !txt.includes("*5"));
ok("Não contém bullets •", !txt.includes("• "));
ok("Contém bola 19h", txt.includes("19h"));

// caso sem goleiros: ainda tem linha de Goleiro: a combinar
const txtSemGk = WhatsAppExporter.buildShareText(d6);
ok("Sem GK: linha 'a combinar' presente", txtSemGk.includes("Goleiro: a combinar"));

// ─── 12. Template da lista ────────────────────────────────────────────────────
console.log("\n[12] Template da lista");

ok("Título correto", LISTA_TEMPLATE_WHATSAPP.includes("Lista Pelada - 19h"));
ok("Tem [campo]", LISTA_TEMPLATE_WHATSAPP.includes("[campo]"));
ok("Tem [goleiros]", LISTA_TEMPLATE_WHATSAPP.includes("[goleiros]"));
ok("Tem [supletes]", LISTA_TEMPLATE_WHATSAPP.includes("[supletes]"));
ok("Não tem instrução de estrelas", !LISTA_TEMPLATE_WHATSAPP.toLowerCase().includes("estrela"));
const supIdx = LISTA_TEMPLATE_WHATSAPP.indexOf("[supletes]");
const afterSupletes = LISTA_TEMPLATE_WHATSAPP.slice(supIdx);
ok("Supletes só até 5", afterSupletes.includes("5.") && !afterSupletes.includes("6."));

// ─── Resultado final ──────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(48)}`);
console.log(`Total: ${passed + failed} | ✓ ${passed} passaram | ✗ ${failed} falharam`);
if (failed > 0) process.exit(1);
