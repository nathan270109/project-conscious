# Análise V2 — pipeline e política de pontuação

Complemento de `docs/analise-v2.md` para trabalho no código.

## Pipeline

```
GithubService.withRepositoryFiles (clone bare temporário, limites CLONE_LIMITS)
  → RepositoryProfiler (framework, CI, scripts, linguagens)
  → 5 Analyzers (docs/testes/a11y/organização/manutenibilidade) → findings por regra
  → ScoringService (penalidades por severidade × recorrência, média das dimensões)
  → RisksService (ordenação de prioridade)
  → InsightsService (insight da menor dimensão)
  → validateAnalysisResult (gate de saída)
```

- Engine exposta via token DI `ANALYSIS_ENGINE` (`useExisting: RepositoryAnalysisEngine`) — trocar a implementação não muda os consumers.
- A coleta retém a pasta temporária até o consumer terminar; aborto cobre a operação toda (clone + leitura).

## Severidade e penalidade

| Severidade | Penalidade |
|---|---|
| CRITICAL | 40 |
| HIGH | 25 |
| MEDIUM | 10 |
| LOW | 5 |

Recorrência (mesma regra em vários arquivos) aumenta a penalidade dentro da dimensão; score de dimensão nunca negativo; score final = média das 5 dimensões, clamp 0–100.

## Regras publicadas (IDs estáveis — não alterar semanticamente)

- DOC001–DOC006 (documentação)
- TEST001–TEST007 (testes)
- A11Y001–A11Y006 (acessibilidade)
- ORG001–ORG003 (organização)
- MAINT001–MAINT008 (manutenibilidade)

Consulte a tabela completa e as condições em `docs/analise-v2.md` — é a fonte da verdade textual; os analyzers são a fonte do código.

## Falsos positivos documentados

- Descrição de README com substância mínima ("Projeto de demonstração.") pode gerar DOC finding: **intencional** (avalia utilidade, não presença literal). Não "corrigir" silenciosamente; o demo conta com esse comportamento.

## Quando o demo precisa ser regenerado

Somente por decisão explícita: snapshot fixado em `backend/src/demo-data/repository-snapshot.json` (hashes Git) + resultado em `analysis-result.json`. `demo.service.spec.ts` reproduz o resultado com os analyzers reais — quebra de spec é sinal de mudança de regra, não de bug do teste.
