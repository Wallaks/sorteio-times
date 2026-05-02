# Visão do produto

## Problema

Grupo grande (~60 pessoas) organiza pelada Fut7 via WhatsApp. Duas vezes por semana publica-se uma lista bruta (titulares numerados, goleiros, suplentes). Fechar a lista e sortear times manualmente é lento e propenso a conflito.

## Objetivo

Uma aplicação onde o organizador **cola o texto do grupo**, o sistema **interpreta nomes e papéis**, e **gera o sorteio** de forma rápida no celular, com **texto pronto para colar de volta no WhatsApp**.

## Requisitos fixos (do projeto)

1. **Documentação obrigatória:** regras e padrões consultáveis fora do código (esta árvore `docs/`).
2. **Lógica no código:** toda regra de sorteio em TypeScript tipado; sem backend.
3. **Simplicidade:** PWA mobile-first; um toque para copiar resultado.

## Escopo funcional alvo

- Importação por colagem (vários formatos de lista do grupo).
- Cadastro manual também é suportado.
- Sorteio em **2 times Fut7** (Colete Azul × Colete Vermelho), 6 jogadores de linha + 1 goleiro por time.
- Goleiros são separados do sorteio de linha — quando inscritos, sempre começam jogando.
- Suplentes da lista do WhatsApp são ignorados na importação (são apenas controle do grupo).
- Exportação formatada para WhatsApp.

## Fora de escopo

- Integração oficial com API do WhatsApp Business.
- Pagamentos ou inscrições financeiras.
- Sistema de pontuação / equilíbrio por nível dos jogadores.
