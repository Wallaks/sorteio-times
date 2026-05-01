# Visão do produto

## Problema

Grupo grande (~60 pessoas) organiza pelada Fut7 via WhatsApp. Duas vezes por semana publica-se uma lista bruta (titulares numerados, goleiros, suplentes). Fechar a lista e sortear times manualmente é lento e propenso a conflito.

## Objetivo

Uma aplicação onde o organizador **cola o texto do grupo**, o sistema **interpreta nomes e papéis**, e **gera o sorteio** de forma reproduzível e rápida no celular, com **texto pronto para colar de volta no WhatsApp**.

## Requisitos fixos (do projeto)

1. **Documentação obrigatória:** regras e padrões consultáveis fora do código puro (esta árvore `docs/`).
2. **Lógica no código:** toda inteligência de negócio e sorteio em linguagem de programação tipada; banco (se houver) só armazena fatos.
3. **Fluxo de fechamento:** horário de corte configurável (ex.: 10 min antes da bola) para **travar** edição e emitir o **sorteio final** (snapshot).
4. **Simplicidade:** PWA ou web mobile-first; um toque para copiar resultado.

## Escopo funcional alvo

- Importação por colagem (vários formatos de lista do grupo).
- Opcional: cadastro manual e ajuste de estrelas / goleiro.
- Sorteio em **3 times** Fut7 (ajustar tamanhos conforme `por time` e regras acordadas).
- Estado **antes do corte** (rascunho) vs **após o corte** (lista fechada + sorteio oficial).
- Exportação formatada para WhatsApp.

## Fora de escopo (por ora)

- Integração oficial com API do WhatsApp Business.
- Pagamentos ou inscrições financeiras.
