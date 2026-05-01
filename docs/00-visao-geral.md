# Visão geral do produto

## Problema

Grupo grande (~60 pessoas) organiza pelada de Fut7 via WhatsApp. Duas vezes por semana surge uma lista bruta (titulares, goleiros, suplentes). Fechar a lista e sortear times manualmente é lento e propenso a conflito.

## Objetivo do app

1. **Colar** o texto do grupo e **interpretar** quem é titular, goleiro e suplente (e metadados como “pode gol” / estrelas, se existirem).
2. **Aplicar** regras de sorteio de forma determinística em relação às regras documentadas (aleatoriedade só onde a regra permitir).
3. **Respeitar um horário de corte** (ex.: 10 minutos antes da bola rolar) para travar edições e fixar o sorteio “oficial”.
4. **Devolver** o resultado em um toque (copiar texto formatado para WhatsApp), otimizado para mobile.

## Persona principal

- **Organizador(a):** uma pessoa responsável pela lista e pelo sorteio; precisa de velocidade e poucos passos no celular.

## Escopo não-objetivo (por ora)

- Integração oficial com API do WhatsApp Business (fora de escopo inicial).
- Gestão financeira ou presença paga.

## Alinhamento com o repositório atual

Existe um protótipo em `index.html` com fluxo de colagem, parsing heurístico e sorteio em **dois** times. A documentação de features deve refletir o comportamento desejado; onde o produto pedir **três** times ou outro formato, isso fica explícito em [F-002](features/F-002-sorteio-times.md) e nos ADRs.
