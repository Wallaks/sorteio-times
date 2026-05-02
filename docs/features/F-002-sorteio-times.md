# F-002: Sorteio de times

- **Status:** implementado
- **Código:** `src/domain/Fut7DrawEngine.ts`
- **Testes:** `tests/qa.ts` (grupos 5 a 10)

## Objetivo

Distribuir jogadores em **dois times** (Colete Azul × Colete Vermelho) seguindo as regras do Fut7 do grupo.

## Regras

### Jogadores de linha

1. Todos os jogadores **não-goleiros** entram num pool único e são embaralhados (Fisher-Yates).
2. O pool é cortado em `listaMax` (default 18) → `naLista` e `foraLista` (suplentes que sobraram).
3. Os primeiros `2 × nPerTeam` (default `2 × 6 = 12`) são os titulares de linha; o restante de `naLista` vira **reservas**.
4. Titulares são distribuídos alternadamente entre Time A e Time B (`i % 2`). Como o pool já está embaralhado, isso é equivalente a sortear cada um para um lado.

### Goleiros (regra crítica)

Goleiros **nunca entram no sorteio de linha**. São tratados num pool separado embaralhado:

| Goleiros inscritos | Comportamento |
|---|---|
| 2 | Um para cada time (aleatório). Ambos jogam. |
| 1 | Cai em um time qualquer. O outro time tira o gol entre os de fora — o app não decide. Warning emitido. |
| 0 | Os dois times combinam no grupo. Warning emitido. |

Goleiros **nunca aparecem em `reservas` nem em `foraLista`** — quem se inscreveu como goleiro sempre joga.

### Warnings

- Sem goleiros inscritos → "Sem goleiros na lista — combinem entre os de fora quem vai no gol."
- 1 goleiro inscrito → "Só um goleiro na lista — o outro time tira o gol entre quem ficou de fora."
- Titulares de linha < `2 × nPerTeam` → mostra a fração faltante.

## Configuração (`DrawConfig`)

- `listaMax`: corte da lista de jogadores de linha (default 18).
- `nPerTeam`: jogadores de linha por time (default 6, totalizando 7 com o goleiro = Fut7).

## Saídas (`Fut7DrawResult`)

- `naLista`, `foraLista`, `reservas`: jogadores de linha por bucket.
- `teamA`, `teamB`: jogadores de linha titulares de cada time.
- `gkA`, `gkB`: goleiros de cada time (`{ player, fromVolunteers }`); `player` pode ser `null`.
- `warnings`: avisos contextualizados.
