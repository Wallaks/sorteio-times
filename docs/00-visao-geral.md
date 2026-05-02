# Visão geral do produto

## Problema

Grupo grande (~60 pessoas) organiza pelada de Fut7 via WhatsApp. Duas vezes por semana surge uma lista bruta (titulares, goleiros, suplentes). Fechar a lista e sortear times manualmente é lento e propenso a conflito.

## Objetivo do app

1. **Colar** o texto do grupo e **interpretar** quem é jogador de linha e quem é goleiro (suplentes são ignorados).
2. **Aplicar** a regra de sorteio Fut7 com goleiros separados do sorteio de linha.
3. **Devolver** o resultado em um toque (copiar texto formatado para WhatsApp), otimizado para mobile.

## Persona principal

- **Organizador(a):** uma pessoa responsável pela lista e pelo sorteio; precisa de velocidade e poucos passos no celular.

## Escopo não-objetivo (por ora)

- Integração oficial com API do WhatsApp Business.
- Gestão financeira ou presença paga.
- Sistema de avaliação por estrelas / equilíbrio por nível (foi descontinuado em favor de simplicidade).

## Alinhamento com o repositório atual

A app está implementada como PWA estática (Vite + TS). Domínio em `src/domain/`, UI em `src/ui/`. Detalhes do sorteio em [F-002](features/F-002-sorteio-times.md), do importador em [F-001](features/F-001-importar-lista-whatsapp.md).
