# Exemplos de listas para teste manual

Cole o conteúdo dos arquivos abaixo na área "Lista do grupo" da app pra ver como cada caso se comporta.

| # | Arquivo | O que testa | Resultado esperado |
|---|---------|-------------|--------------------|
| 01 | [completa-padrao.txt](01-completa-padrao.txt) | Template ideal: 18 de linha + 2 goleiros + supletes preenchidos | 6+6 titulares, 6 reservas, 2 goleiros voluntários, supletes ignorados, sem warnings |
| 02 | [sem-goleiro.txt](02-sem-goleiro.txt) | 12 de linha, nenhum goleiro inscrito | 6+6 titulares, gkA/gkB nulos, warning "Sem goleiros na lista" |
| 03 | [um-goleiro.txt](03-um-goleiro.txt) | 14 de linha + 1 goleiro | 6+6 titulares, 2 reservas, 1 time com goleiro, warning "Só um goleiro" |
| 04 | [cheia-com-supletes.txt](04-cheia-com-supletes.txt) | 20 inscritos de linha + 2 goleiros (lista cheia + sobrou suplente) | 6+6 titulares, 6 reservas, 2 supletes "fora da lista de 18" |
| 05 | [lista-curta-incompleta.txt](05-lista-curta-incompleta.txt) | Só 8 jogadores, fica abaixo do mínimo | 4+4 titulares, warning "Titulares de linha: 8/12" |
| 06 | [formato-lista-do-fut.txt](06-formato-lista-do-fut.txt) | Formato livre do Zap (sem colchetes, com cabeçalhos `Goleiros:` / `Suplentes`) | Importa só linha + goleiros, ignora suplentes |
| 07 | [lista-plana.txt](07-lista-plana.txt) | Só nomes, um por linha, sem cabeçalho nenhum | Todos importados como jogadores de linha |
| 08 | [com-markdown.txt](08-com-markdown.txt) | Nomes com `*negrito*` e `_itálico_` colados do Zap | Markdown removido dos nomes |
| 09 | [gol-inline.txt](09-gol-inline.txt) | Marcador `(gol)` no fim do nome | Jogador marcado como goleiro mesmo fora da seção `[goleiros]` |
| 10 | [bagunca-instrucoes.txt](10-bagunca-instrucoes.txt) | Lista com instruções, separadores `———`, linhas em branco | Só nomes válidos importados, instruções filtradas |
| 11 | [duplicados.txt](11-duplicados.txt) | Mesmo nome aparecendo duas vezes (e variações com acento) | Duplicatas ignoradas no segundo encontro |
| 12 | [excesso-goleiros.txt](12-excesso-goleiros.txt) | 3 goleiros inscritos (regra é máximo 2) | Os 3 importados; sorteio escolhe 2 aleatórios; warning "3 goleiros inscritos — só 2 entram no sorteio" |

## Como testar

1. Abre o arquivo da lista que você quer testar.
2. Copia o texto inteiro (Ctrl+A, Ctrl+C).
3. Na app, cola na textarea "Lista do grupo" e clica **Importar lista**.
4. Confere a lista de jogadores que apareceu.
5. Ajusta `Tamanho da lista` e `Por time` se quiser, e clica **Sortear**.
6. Confere os times, reservas, supletes e os warnings.

## Notas

- Os arquivos `.txt` simulam exatamente o texto que chega do WhatsApp (incluindo emojis, markdown e bagunça).
- Pra "limpar a sessão" entre os testes, usa o botão **Limpar jogadores** na app.
- A regra geral está documentada em [`docs/features/F-002-sorteio-times.md`](../docs/features/F-002-sorteio-times.md).
