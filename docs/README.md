# Documentação — Pelada Fut7 / Sorteio

**Objetivo:** ser a fonte da verdade para regras de negócio, decisões técnicas e o mapeamento *funcionalidade ↔ código*. O código deve permanecer enxuto; o “porquê” e o contrato de comportamento ficam aqui e em comentários de módulo (TSDoc) onde fizer sentido.

## Como navegar

| Área | Conteúdo |
|------|----------|
| [Visão geral](00-visao-geral.md) | Problema, personas, fluxo macro |
| [Arquitetura](architecture/README.md) | Camadas, fronteiras, dados |
| [Estrutura do código `src/`](code-structure.md) | Pastas, classes e responsabilidades |
| [Regras de negócio](business-rules/README.md) | Sorteio, parse, corte — com links para implementação |
| [Funcionalidades](features/README.md) | Uma página por feature (contrato + edge cases) |
| [ADRs](adr/README.md) | Decisões arquiteturais registradas |

## Convenções

- **ID de feature:** `F-###` (ex.: `F-001`) — usado em issues, commits e cabeçalhos de doc.
- **Ligação código ↔ doc:** cada módulo de domínio referencia o doc da feature; cada doc lista os arquivos de código responsáveis.
- **Lógica de negócio:** apenas em TypeScript (ou linguagem escolhida no ADR); banco/armazenamento não expressam regra (apenas persistência).

## Índice rápido (a preencher conforme o código evoluir)

- [F-001 — Importar lista do WhatsApp](features/F-001-importar-lista-whatsapp.md)
- [F-002 — Sorteio de times](features/F-002-sorteio-times.md)
- [F-003 — Corte / travamento da lista](features/F-003-corte-lista.md)
- [F-004 — Exportar resultado para WhatsApp](features/F-004-exportar-whatsapp.md)
