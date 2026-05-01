# F-004: Exportar resultado para WhatsApp

- **Status:** rascunho

## Objetivo

Gerar texto com negrito/itálico compatível com WhatsApp e **copiar em um toque** (mobile-first).

## Regras

1. Incluir seções acordadas: lista, times, reservas, suplentes (conforme F-002).
2. Manter caracteres e quebras de linha estáveis entre plataformas.
3. Não depender de backend para copiar (Clipboard API com fallback).

## Implementação (ponteiro)

- **Código:** `src/domain/WhatsAppExporter.ts` (classe `WhatsAppExporter`)
- **Modelo de lista:** `src/domain/listaTemplate.ts`
