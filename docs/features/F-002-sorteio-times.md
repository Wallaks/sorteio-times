# F-002: Sorteio de times

- **Status:** rascunho

## Objetivo

Distribuir jogadores em times conforme parâmetros (jogadores por time, equilíbrio por estrelas opcional, regras de goleiro).

## Esclarecimento de produto: “3 times”

O enunciado do projeto menciona **três times**; o protótipo atual implementa **dois times** (7×7). Antes de implementar:

- Confirmar se a pelada é **2 times de 7** (comum em Fut7) ou **3 times** rotativos / mini-jogos.
- Atualizar este documento com o número de times, tamanho e se há **rodízio** de goleiros entre mais de dois.

## Regras (baseadas no protótipo atual — 2 times)

1. Embaralhar ordem global dos jogadores para numerar a “lista” e definir titulares.
2. Opcional: equilibrar **titulares** por soma de estrelas (greedy por soma acumulada).
3. Goleiro: preferir voluntários `podeGoleiro`; se faltar, sortear entre titulares e emitir aviso.

## Saídas

- Lista numerada (1…N na lista)
- Times com goleiro destacado
- Reservas / suplentes conforme corte da lista

## Implementação (ponteiro)

- **Código:** `src/domain/Fut7DrawEngine.ts` (classe `Fut7DrawEngine`)
- **Testes (sugerido):** seed opcional para reprodutibilidade
