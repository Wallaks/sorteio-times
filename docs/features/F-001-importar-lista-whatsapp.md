# F-001: Importar lista do WhatsApp

- **Status:** rascunho
- **Relacionado:** protótipo em `index.html` (funções `parsePasteLine`, `parseStructuredList`, `parseWhatsAppFutList`, etc.)

## Objetivo

Transformar texto colado do grupo em uma lista estruturada de participantes com atributos mínimos (nome, pode ser goleiro, estrelas opcionais).

## Regras (alto nível)

1. Suportar **lista com seções** (`[campo]`, `[goleiros]`, `[suplentes]`) e **lista “Lista do Fut”** com cabeçalhos estilo grupo.
2. Ignorar linhas vazias, separadores e instruções conhecidas (ver implementação para lista de prefixos).
3. **Duplicatas** pelo mesmo nome normalizado são ignoradas na importação.
4. Caracteres invisíveis comuns do WhatsApp devem ser removidos antes do parse.

## Saída esperada (conceitual)

Uma coleção de `{ nome, podeGoleiro, estrelas? }` pronta para validação e sorteio (F-002).

## Edge cases

- Linha só com número sem nome → ignorar.
- Nome com `*1`–`*5` ou `| 3` no fim → estrelas.
- `(gol)` no fim do nome → marcação de goleiro quando aplicável.

## Implementação (ponteiro)

- **Código:** `src/domain/ListParser.ts` (classe `ListParser`)
- **Testes (sugerido):** fixtures `.txt` + Vitest
