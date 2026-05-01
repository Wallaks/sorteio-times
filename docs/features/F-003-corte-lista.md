# F-003: Corte e travamento da lista

- **Status:** rascunho

## Objetivo

Definir um instante (ex.: **10 minutos antes do horário da bola**) em que a lista deixa de ser editável e o sorteio final fica **fixo** para consulta e cópia.

## Regras

1. **Antes do corte:** organizador pode alterar inscrições, reimportar texto (política de merge a definir: substituir vs acrescentar).
2. **No ou após o corte:** estado “congelado”: mesmos jogadores e mesmos parâmetros de sorteio usados na versão oficial (se o sorteio for obrigatório no corte, registrar timestamp e seed se houver).
3. **Transparência:** mostrar claramente na UI “Lista travada — jogo às HH:MM”.

## Modos

- **Local (sem backend):** `matchStartAt` + `cutoffMinutes` armazenados localmente; `lock` calculado no domínio com função de relógio injetável.
- **Servidor (opcional):** servidor armazena horário do jogo e momento de lock; clientes só exibem.

Ver [architecture/README.md](../architecture/README.md).

## Implementação (ponteiro)

- **Hoje:** não implementado no protótipo
- **Alvo:** `src/domain/lock/` + persistência do estado de sessão
