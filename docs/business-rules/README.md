# Regras de negócio (fonte conceitual)

Este diretório agrega **regras estáveis** em linguagem de negócio. Os detalhes algorítmicos e edge cases ficam nas páginas de [features](../features/README.md); os ADRs explicam **mudanças** de regra ao longo do tempo.

## Regras de ouro (projeto)

1. **Documentação obrigatória:** cada funcionalidade tem página em `docs/features/` e referências cruzadas no código.
2. **Lógica no código:** sorteio, parse, corte e validações implementados em linguagem de programação testável — não no banco.
3. **Fluxo de fechamento:** após o corte, a lista e o sorteio ficam **imutáveis** (salvo decisão explícita de “reabrir” documentada).
4. **Simplicidade:** mobile-first, copiar resultado em um toque.

## Mapa rápido

| Tema | Documento de feature | Módulo de código |
|------|------------------------|------------------|
| Interpretar colagem WhatsApp | [F-001](../features/F-001-importar-lista-whatsapp.md) | `src/domain/ListParser.ts` |
| Sorteio (times, goleiros, equilíbrio) | [F-002](../features/F-002-sorteio-times.md) | `src/domain/Fut7DrawEngine.ts` |
| Corte e lock | [F-003](../features/F-003-corte-lista.md) | *(a implementar em `src/domain/`)* |
| Texto para WhatsApp | [F-004](../features/F-004-exportar-whatsapp.md) | `src/domain/WhatsAppExporter.ts` |

## Glossário

- **Lista numerada / “pedra”:** ordem aleatória ou sorteada dos inscritos para numerar camisas/chuteiras — conforme regra em F-002.
- **Titular / reserva / suplente:** definições exatas devem coincidir com o parser e com o texto do grupo; qualquer ambiguidade vira caso de teste em F-001.
