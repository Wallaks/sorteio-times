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

// ─── 5. DrawEngine: 14 jogadores, 2 goleiros, 7 por time ─────────────────────
console.log("\n[5] Draw: 14 jogadores + 2 goleiros, 7 por time");

const jogadores14 = Array.from({ length: 14 }, (_, i) => ({
  name: `Jogador${i + 1}`,
  canGK: i < 2,
  stars: 3,
}));

const engine = new Fut7DrawEngine();
const d5 = engine.draw(jogadores14, { listaMax: 14, nPerTeam: 7, balanceByStars: false });

ok("14 na lista", d5.naLista.length === 14);
ok("Time A com 7", d5.teamA.length === 7, `got ${d5.teamA.length}`);
ok("Time B com 7", d5.teamB.length === 7, `got ${d5.teamB.length}`);
ok("Sem reservas", d5.reservas.length === 0);
ok("Sem supletes", d5.foraLista.length === 0);
ok("Goleiro atribuído sempre vem dos voluntários",
  (d5.gkA.player === null || d5.gkA.fromVolunteers) &&
  (d5.gkB.player === null || d5.gkB.fromVolunteers));
ok("Pelo menos um time tem goleiro voluntário", d5.gkA.player !== null || d5.gkB.player !== null);
ok("Sem warnings", d5.warnings.length === 0, `warnings: ${d5.warnings.join("; ")}`);

// Roda 50x para garantir que a invariante sempre vale (sem erro de runtime)
let gkBugFound = false;
for (let i = 0; i < 50; i++) {
  const dx = engine.draw(jogadores14, { listaMax: 14, nPerTeam: 7, balanceByStars: false });
  if ((dx.gkA.player && !dx.gkA.fromVolunteers) || (dx.gkB.player && !dx.gkB.fromVolunteers)) {
    gkBugFound = true;
  }
}
ok("Goleiro nunca é atribuído fora dos voluntários (50 sorteios)", !gkBugFound);

// ─── 6. DrawEngine: 12 jogadores, 0 goleiros, 6 por time ─────────────────────
console.log("\n[6] Draw: 12 jogadores, sem goleiro, 6 por time");

const jogadores12 = Array.from({ length: 12 }, (_, i) => ({
  name: `Player${i + 1}`,
  canGK: false,
  stars: 3,
}));

const d6 = engine.draw(jogadores12, { listaMax: 12, nPerTeam: 6, balanceByStars: false });

ok("12 na lista", d6.naLista.length === 12);
ok("Time A com 6", d6.teamA.length === 6);
ok("Time B com 6", d6.teamB.length === 6);
ok("Goleiro A nulo (sem voluntários)", d6.gkA.player === null);
ok("Goleiro B nulo (sem voluntários)", d6.gkB.player === null);
ok("Sem warnings de goleiro", !d6.warnings.some(w => w.includes("goleiro")));

// ─── 7. DrawEngine: 10 jogadores, 7 por time (titulares incompletos) ──────────
console.log("\n[7] Draw: 10 jogadores, 7 por time (titulares incompletos)");

const jogadores10 = Array.from({ length: 10 }, (_, i) => ({
  name: `P${i + 1}`,
  canGK: false,
  stars: 3,
}));

const d7 = engine.draw(jogadores10, { listaMax: 18, nPerTeam: 7, balanceByStars: false });

ok("10 na lista (não 18)", d7.naLista.length === 10);
ok("Time A com 5 (metade de 10)", d7.teamA.length === 5, `got ${d7.teamA.length}`);
ok("Time B com 5", d7.teamB.length === 5, `got ${d7.teamB.length}`);
ok("Warning de titulares incompletos", d7.warnings.some(w => w.includes("Titular")));

// ─── 8. DrawEngine: lista com 18 mas só 14 jogam (listaMax=18, nPerTeam=7) ────
console.log("\n[8] Draw: 18 na lista, 7 por time (4 reservas)");

const jogadores18 = Array.from({ length: 18 }, (_, i) => ({
  name: `J${i + 1}`,
  canGK: i === 0 || i === 1,
  stars: 3,
}));

const d8 = engine.draw(jogadores18, { listaMax: 18, nPerTeam: 7, balanceByStars: false });

ok("18 na lista", d8.naLista.length === 18);
ok("Time A com 7", d8.teamA.length === 7);
ok("Time B com 7", d8.teamB.length === 7);
ok("4 reservas (18 - 14)", d8.reservas.length === 4, `got ${d8.reservas.length}`);
ok("Sem supletes (todos na lista de 18)", d8.foraLista.length === 0);

// ─── 9. DrawEngine: 20 inscritos, lista máx 18 (2 supletes) ─────────────────
console.log("\n[9] Draw: 20 inscritos, lista máx 18 (2 supletes)");

const jogadores20 = Array.from({ length: 20 }, (_, i) => ({
  name: `X${i + 1}`,
  canGK: false,
  stars: 3,
}));

const d9 = engine.draw(jogadores20, { listaMax: 18, nPerTeam: 7, balanceByStars: false });

ok("18 na lista (cortados em 18)", d9.naLista.length === 18);
ok("2 supletes (fora da lista)", d9.foraLista.length === 2, `got ${d9.foraLista.length}`);
ok("4 reservas na lista", d9.reservas.length === 4);

// ─── 10. WhatsAppExporter ─────────────────────────────────────────────────────
console.log("\n[10] WhatsAppExporter: formato do texto gerado");

const txt = WhatsAppExporter.buildShareText(d8);
ok("Contém título", txt.includes("Pelada — Sorteio de Times"));
ok("Contém Time A", txt.includes("*Time A*"));
ok("Contém Time B", txt.includes("*Time B*"));
ok("Contém lista numerada", txt.includes("1."));
ok("Contém Reservas", txt.includes("*Reservas*"));
ok("Não contém estrelas", !txt.includes("⭐"));
ok("Contém bola 19h", txt.includes("19h"));

// ─── 11. Template da lista ────────────────────────────────────────────────────
console.log("\n[11] Template da lista");

ok("Título correto", LISTA_TEMPLATE_WHATSAPP.includes("Lista Pelada - 19h"));
ok("Tem [campo]", LISTA_TEMPLATE_WHATSAPP.includes("[campo]"));
ok("Tem [goleiros]", LISTA_TEMPLATE_WHATSAPP.includes("[goleiros]"));
ok("Tem [supletes]", LISTA_TEMPLATE_WHATSAPP.includes("[supletes]"));
ok("Não tem instrução de estrelas", !LISTA_TEMPLATE_WHATSAPP.includes("*5"));
const supIdx = LISTA_TEMPLATE_WHATSAPP.indexOf("[supletes]");
const afterSupletes = LISTA_TEMPLATE_WHATSAPP.slice(supIdx);
ok("Supletes só até 5", afterSupletes.includes("5.") && !afterSupletes.includes("6."));

// ─── Resultado final ──────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(48)}`);
console.log(`Total: ${passed + failed} | ✓ ${passed} passaram | ✗ ${failed} falharam`);
if (failed > 0) process.exit(1);
