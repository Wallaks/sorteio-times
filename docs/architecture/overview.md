# Arquitetura — visão geral

## Stack recomendada (alinhada ao projeto)

| Camada | Escolha sugerida | Motivo |
|--------|-------------------|--------|
| Linguagem | **TypeScript** | Regras de domínio testáveis, tipos compartilhados, documentação via TSDoc nos pontos de entrada. |
| UI | **Vite + React** (ou manter HTML e extrair JS para módulos TS) | Mobile-first, ecossistema maduro, fácil PWA com `vite-plugin-pwa`. |
| Domínio | **Pacote ou pasta `src/domain/`** puro | Sorteio, parsing, política de corte **sem** React/DOM. |
| Testes | **Vitest** | Mesma toolchain do Vite; testes de unidade obrigatórios para `domain/`. |
| Persistência local | **localStorage** + versão de schema | Rápido, offline; serializa apenas dados, não regras. |
| Backend opcional | **Nenhum no MVP**; se precisar sync entre dispositivos depois: API mínima (Node/Fastify ou serverless) que persiste **snapshots** já calculados | Regras continuam no cliente ou em biblioteca compartilhada, não no SQL. |

## Diagrama lógico (MVP)

```mermaid
flowchart TB
  subgraph ui [UI]
    Paste[Colagem WhatsApp]
    Config[Config jogo e corte]
    Result[Resultado e copiar]
  end
  subgraph domain [Domain TypeScript]
    Parse[Parser de lista]
    Draw[Motor de sorteio]
    Cutoff[Política de corte]
  end
  subgraph data [Dados]
    LS[(localStorage)]
  end
  Paste --> Parse
  Config --> Cutoff
  Parse --> Draw
  Cutoff --> Draw
  Draw --> Result
  ui <--> LS
```

## Fronteiras

- **`domain/`:** funções puras (ou com RNG injetável para testes): `parseLista`, `sortearTimes`, `aplicarCorte`, tipos `Jogador`, `SnapshotSorteio`.
- **`app/` ou `components/`:** apenas orquestração, timers de UI, formatação de texto para clipboard.
- **`storage/`:** `load`/`save` de JSON; migração de chaves quando mudar o schema.

## Evolução a partir do estado atual

O repositório contém `index.html` monolítico com lógica embutida. A migração recomendada é:

1. Extrair parsing e sorteio para `src/domain/*.ts`.
2. Cobrir com testes os casos de colagem reais (fixtures em `src/domain/__fixtures__/`).
3. Generalizar o sorteio de 2 para **3 times** no domínio; UI só repete blocos.
4. Adicionar **deadline**: comparar `Date.now()` com `dataHoraJogo - offset`; ao passar o corte, desabilitar edição e gravar `sorteioFinal`.

Detalhes de regras: [business-rules/README.md](../business-rules/README.md).
