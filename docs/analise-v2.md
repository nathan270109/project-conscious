# Análise V2

A Análise V2 transforma verificações genéricas em achados rastreáveis, específicos e orientados à correção. O fluxo cria um perfil do repositório uma única vez, executa os analisadores com contexto de framework e centraliza a pontuação.

## Fluxo

1. A coleta seleciona código, templates, documentação e configurações relevantes, ignorando dependências, artefatos de build, binários e lockfiles.
2. O `RepositoryProfiler` identifica framework, gerenciador de pacotes, scripts, frontend/backend, testes, CI e distribuição dos arquivos.
3. Cada analisador produz findings normalizados e agrega repetições da mesma regra no mesmo arquivo.
4. O `ScoringService` calcula todas as dimensões com a mesma política de penalização.
5. Dashboard e Conscious AI recebem o mesmo contrato público.

## Contrato público

Cada finding contém `ruleId`, categoria, severidade, título, descrição, impacto, correção, evidência opcional, arquivo, linha e quantidade de ocorrências. `reference` e `confidence` não fazem parte do contrato público e não são exibidos, evitando sobrecarga de informação.

## Cobertura atual

- Documentação: README principal, introdução substancial, instalação, execução, testes e consistência dos scripts documentados.
- Testes: configuração, casos executáveis, asserções, testes focados/ignorados e distribuição entre código-fonte e testes.
- Acessibilidade: nomes acessíveis, labels, imagens, links, botões, interação por teclado e idioma em templates HTML.
- Organização: convenções específicas de Angular e React, profundidade de diretórios e presença de CI em projetos maiores.
- Manutenibilidade: `console.log`, `catch` vazio, uso repetido de `any`, tamanho de arquivos e funções, complexidade, aninhamento e quantidade de parâmetros, usando AST do TypeScript.

## Pontuação

Cada dimensão começa em 100. A penalidade-base é 40 para `CRITICAL`, 25 para `HIGH`, 10 para `MEDIUM` e 5 para `LOW`. Ocorrências repetidas aumentam a penalidade de forma logarítmica e limitada, evitando que duplicações dominem o resultado. A nota geral é a média arredondada das cinco dimensões.

## Limitações

- A análise profunda de acessibilidade cobre HTML externo; JSX e templates inline geram um finding explícito de cobertura ainda não avaliada.
- As regras estáticas não substituem testes em navegador, auditoria assistiva manual ou cobertura dinâmica.
- Thresholds de tamanho e complexidade são heurísticas e devem evoluir com dados reais de falsos positivos e correções aceitas.
