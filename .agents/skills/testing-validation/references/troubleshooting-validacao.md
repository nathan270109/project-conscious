# Troubleshooting — falhas comuns de validação

Sintoma → causa provável → correção.

## Frontend

| Sintoma | Causa provável | Correção |
|---|---|---|
| Template não atualiza após mudar dado | zoneless sem notificação | mover p/ `signal`/`computed` ou `markForCheck` (nunca zone.js) |
| `ExpressionChangedAfterItHasBeenCheckedError` | mutação sem notificação | estado via signal; imutabilidade (`set`/`update`) |
| Teste trava no timeout HTTP | falta flush/verify no `HttpTestingController` | `expectOne` + `flush` + `http.verify()` |
| Falha "resposta incompatível" nos specs | payload fora do contrato | validar contra `isAnalysisResult` e fixture oficial |
| Budget de bundle estourado no build | componente/asset pesado | lazy `loadComponent`/`@defer`; verificar assets |

## Backend

| Sintoma | Causa provável | Correção |
|---|---|---|
| `no-floating-promises` no lint | promessa não tratada | `await`, `void`, ou `.catch` explícito |
| e2e falha com 400/404 inesperado | corpo fora do contrato (`FAILED` seguro) | conferir `docs/api-contract.md`; não vazar detalhes |
| E2E de fluxo falha no clone | GithubService real em vez do mock | `overrideProvider` no AppModule (ver `analysis-flow.e2e-spec.ts`) |
| Classificação errada do erro git | regex de mensagem em inglês não casou | cobrir variação de mensagem no spec de `classifyError` |
| Build Nest falha em types | tsbuildinfo stale | `rm -f tsconfig.build.tsbuildinfo` e rebuild |

## Launcher / ambiente

| Sintoma | Correção |
|---|---|
| "Node não suportado" | usar Node 24.x (ou 22.22.x/26+); não fazer downgrade de deps |
| Porta em uso | launcher já escolhe porta livre; se manual, `--check` para diagnóstico |
| `--smoke` falha sem rede | esperado: exige internet + git; rodar offline apenas `--check` |
| Windows: script CRLF/LF | respeitar `.gitattributes` (`*.cmd` CRLF, `*.sh`/`*.command` LF) |

## Antes de dizer "pronto"

1. Rode a matriz da camada tocada (skill: seção Matriz).
2. Diff limpo: sem segredos, sem `dist/`, sem `.analysis-tmp/`.
3. Documentos tocados? (`api-contract.md`, `analise-v2.md`) → atualizou doc + type guard + e2e?
