# F-001: Importar lista do WhatsApp

- **Status:** implementado
- **Código:** `src/domain/ListParser.ts`
- **Testes:** `tests/qa.ts` (grupos 1 a 4d)

## Objetivo

Transformar texto colado do grupo em uma lista estruturada de participantes com atributos mínimos: `{ name, canGK }`.

## Formatos suportados

1. **Lista estruturada com colchetes** (formato do template do app):
   ```
   [campo]
   1. Fulano
   2. Beltrano
   ...
   [goleiros]
   1. Goleiro1
   2. Goleiro2
   [suplentes]
   1. Suplente1
   ```
2. **Lista do Fut** estilo livre do WhatsApp:
   ```
   Lista do Fut
   1. Fulano
   ...
   Goleiros:
   1. Goleiro1
   Suplentes
   1. Suplente1
   ```
3. **Lista plana** (um nome por linha, sem cabeçalhos).

## Regras de interpretação

1. Linhas vazias, separadores (`---`, `———`) e instruções conhecidas são ignoradas (filtros explícitos no parser).
2. **Suplentes / suplentes são totalmente ignorados** — a seção é apenas controle do grupo no Zap, não compõe sorteio.
3. **Duplicatas** pelo mesmo nome normalizado (acentos, caixa) são ignoradas.
4. **Markdown do WhatsApp** (`*nome*`, `_nome_`, `~nome~`) é removido antes do parse.
5. Caracteres invisíveis (zero-width) são removidos (`stripInvisible`).
6. Sufixo `(gol)` no nome marca o jogador como goleiro mesmo fora da seção `[goleiros]`.
7. Linhas que casam com `lista pelada`, `não modifique`, `copiem`, etc. nunca viram jogador.

## Saída

`ParsedImportLine[]` onde cada item é `{ name: string, canGK: boolean }`. A camada UI deduplica contra a lista atual antes de adicionar.
