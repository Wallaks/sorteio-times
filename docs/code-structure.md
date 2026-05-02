# Estrutura do código (`src/`)

Mapa para navegação. **Regras de negócio** ficam em `domain/`; **UI** em `ui/`; **persistência** em `storage/`; utilitários compartilhados em `utils/`.

```
src/
  main.ts                 # Entrada: importa CSS, monta PeladaApp, registra service worker
  styles/
    app.css               # Estilos da PWA
  domain/
    types.ts              # Player, ParsedImportLine, DrawConfig, Fut7DrawResult
    playerUtils.ts        # nameKey (normalização), normalizePlayer, toPlayer
    textUtils.ts          # stripInvisible (limpa caracteres invisíveis do WhatsApp)
    random.ts             # shuffle (Fisher-Yates)
    ListParser.ts         # Classe: parse de texto colado (F-001)
    Fut7DrawEngine.ts     # Classe: sorteio Fut7 com goleiros separados (F-002)
    listaTemplate.ts      # Modelo de lista para o grupo
    WhatsAppExporter.ts   # Classe: texto para colar no Zap (F-004)
  storage/
    PeladaStorage.ts      # localStorage JSON (jogadores, listaMax, perTeam)
  ui/
    PeladaApp.ts          # Classe: liga DOM ↔ domínio, eventos, renderização
  utils/
    clipboard.ts          # Copiar para área de transferência

tests/
  qa.ts                   # Suíte manual (rodar com `npx tsx tests/qa.ts`)

public/
  manifest.json           # PWA manifest
  sw.js                   # Service worker (cache-first)
  icons/icon.svg          # Ícone (bola de futebol)
```

## Build

- **Dev:** `npm run dev` (Vite)
- **Produção:** `npm run build` → `tsc --noEmit && vite build` → `dist/`
- **Testes:** `npx tsx tests/qa.ts`

## Convenções

- Domínio puro: nada no `domain/` toca DOM, `localStorage` ou network.
- UI: `PeladaApp` é a única classe que conhece o DOM concreto; tudo passa por `req<T>()` para ids.
- Cada módulo de domínio referencia a feature em `docs/features/` no comentário de cabeçalho.
