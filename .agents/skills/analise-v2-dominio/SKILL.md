---
name: analise-v2-dominio
description: Domínio do motor de análise V2 do Project Conscious — cinco dimensões, analyzers, profiler, scoring, findings e insight. Use quando criar/ajustar regras de análise, ruleIds, penalidades, ordenação de riscos, insight ou o contrato AnalysisResult. NÃO use para UI/UX, Terraform ou configuração de servidor.
---

# Domínio — Análise V2

Motor que transforma arquivos de um repositório clonado em um `AnalysisResult` validado. Fontes: `docs/analise-v2.md`, `backend/src/analysis/`, `scoring/`, `risks/`, `insights/`.

## Fluxo de trabalho ao alterar regras

1. Localize o analyzer da dimensão em `backend/src/analysis/analyzers/` (documentacao, testes, acessibilidade, organizacao, manutenibilidade).
2. Regras são determinísticas com IDs estáveis (`DOC001-006`, `TEST001-007`, `A11Y001-006`, `ORG001-003`, `MAINT001-008`). **Nunca reutilizar/mexer num ruleId publicado** — o frontend e a IA consomem esses IDs.
3. Findings são criados por `finding.utils.ts`; cada finding carrega ruleId, severidade, arquivo/linha e explicação.
4. Atualize `docs/analise-v2.md` + spec do analyzer + e2e do fluxo.
5. Valide: `npm test`, `npm run test:e2e` em `backend/`.

## Regras de pontuação (não quebre)

- Penalidades por severidade com fator de recorrência: **CRITICAL 40, HIGH 25, MEDIUM 10, LOW 5** (`scoring.service.ts`).
- Score da dimensão = 100 − penalidades; **score final = média das 5 dimensões**, clamp 0–100.
- Saída sempre passada por `validateAnalysisResult` (`analysis-result.validator.ts`) antes de responder — inclusive o demo.

## Cinco dimensões e cobertura

| Dimensão | O que avalia | Examples de regras |
|---|---|---|
| Documentação (DOC) | README, descrição, docs suficientes | substância mínima — frase curta tipo "Projeto de demonstração." NÃO conta como apresentação suficiente |
| Testes (TEST) | presença/config de testes, cobertura declarada | |
| Acessibilidade (A11Y) | alt/aria/labels em HTML | |
| Organização (ORG) | estrutura de pastas, profundidade (limite atual 8 níveis) | |
| Manutenibilidade (MAINT) | tamanho de arquivo (limite 400 linhas), arquivos gigantes | |

`RepositoryProfiler` detecta framework/CI/scripts e alimenta as regras; analyzers recebem arquivos do clone via `GithubService.withRepositoryFiles`.

## Contrato do resultado

`AnalysisResult`: `status` (COMPLETED/FAILED), `score`, `dimensions[]`, `findings[]` (ruleId DOC/TEST/A11Y/ORG/MAINT + severidade CRITICAL/HIGH/MEDIUM/LOW), `insight`. Referência completa em `docs/api-contract.md`; type guard do frontend em `core/models/analysis-result.guard.ts`.

- `RisksService.sortByPriority`: severidade → categoria → arquivo → linha.
- `InsightsService.generate`: insight pela **menor dimensão** + finding prioritário.

## Gotchas

- Modo demo (`demo-data/analysis-result.json`) é um `AnalysisResult` real validado (score 72, 9 findings) — se as regras mudarem, o demo fica desatualizado propositalmente (revisão fixada `2770289e…`); só regenerar com decisão explícita.
- O demo é reproduzido pelos 5 analyzers reais em `demo.service.spec.ts` — mudança de regra quebra esse spec (é o esperado: verifique se a diferença é aceitável).
- Limites (400 linhas, 8 níveis) estão em constantes nos analyzers; README antigo cita 300/6 — o código é a verdade.
- A IA de chat recebe findings como contexto com sanitização e anti-injection (`infra/lambda/app.py`); mudanças no formato de findings precisam checar a Lambda também.

## Referências

- `references/analise-v2-resumo.md` — visão detalhada do pipeline e política de pontuação.
- `docs/analise-v2.md`, `docs/api-contract.md` (raiz do repo).
