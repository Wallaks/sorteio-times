# Estrutura do código (`src/`)

Mapa para navegação (Ctrl+P no editor). **Regras de negócio** ficam em `domain/`; **UI** em `ui/`; **persistência** em `storage/`; utilitários compartilhados em `utils/`.

```
src/
  main.ts                 # Entrada: importa CSS, monta PeladaApp
  styles/
    app.css               # Estilos da PWA (extraídos do HTML legado)
  domain/
    types.ts              # Player, ParsedImportLine, DrawConfig, Fut7DrawResult, …
    playerUtils.ts        # Normalização, chave de nome, estrelas, labels
    textUtils.ts          # stripInvisible (WhatsApp)
    random.ts             # shuffle, pickRandom, sumStars
    ListParser.ts         # Classe: parse de texto colado (F-001)
    Fut7DrawEngine.ts     # Classe: sorteio Fut7 7×7 (F-002)
    listaTemplate.ts      # Modelo de lista para o grupo
    WhatsAppExporter.ts   # Classe: texto para colar no Zap (F-004)
  storage/
    PeladaStorage.ts      # localStorage JSON (estado da tela)
  ui/
    PeladaApp.ts          # Classe: liga DOM ↔ domínio, eventos, renderização
  utils/
    clipboard.ts          # Copiar para área de transferência
```

## Build

- **Dev:** `npm run dev` (Vite)
- **Produção:** `npm run build` → pasta `dist/` (servir arquivos estáticos; `manifest.json` vem de `public/`)

## Documentação cruzada

Cada módulo de domínio referencia a feature em `docs/features/` nos comentários de cabeçalho onde aplicável.
