---
name: testing-validation
description: Valida e testa o Project Conscious em todas as camadas — unit/e2e do frontend Angular, unit/e2e do backend NestJS, launcher multiplataforma, lint e build. Use antes de finalizar qualquer tarefa, ao escrever novos testes, ao ajustar CI ou ao diagnosticar falhas de validação. NÃO use para implementar features de domínio.
---

# Testing & Validation — todas as camadas

Regra do repo: **tarefa só está pronta após os comandos de validação relevantes passarem.**

## Matriz de validação obrigatória

| Camada | Onde | Comandos |
|---|---|---|
| Frontend (mínimo) | raiz | `npm test -- --watch=false` + `npm run build` |
| Backend | `backend/` | `npm test`, `npm run test:e2e`, `npm run lint`, `npm run build` |
| Launcher | raiz | `npm run test:launcher` |
| Ensaio completo (internet) | raiz | `npm run conscious:start -- --smoke` |
| Diagnóstico de ambiente | raiz | `npm run conscious:start -- --check` |

Toque em backend? Rode os 4 do backend. Toque no launcher? Rode `test:launcher`. Só frontend? Os dois da raiz bastam.

## Frontend (Vitest via `@angular/build:unit-test`)

- Spec colado ao código, mesmo nome base. Fixture única: `createAnalysisFixture()` em `src/app/core/testing/analysis.fixture.ts` — nada de fixture inline nova.
- HTTP com `HttpTestingController` (`expectOne`, `flush`, `http.verify()`); fluxo de navegação com `RouterTestingHarness`; integração com `navigateByUrl` + `whenStable`.
- Tabela de casos com `it.each`; fake timers para timeouts; mocks com `vi.fn()`/`vi.spyOn`.
- Zoneless: preferir `whenStable()` a `detectChanges()` forçado.

## Backend (Vitest + supertest)

- Unit: `*.spec.ts` colado (`src/**/*.spec.ts`); e2e: `backend/test/*.e2e-spec.ts` (config `vitest.config.e2e.ts`).
- E2E sobe `AppModule` real com `overrideProvider` nos limites externos (GithubService); nunca mockar o motor de análise em e2e de contrato.
- Resposta do motor validada com `validateAnalysisResult`; corpo `FAILED` nunca deve conter stack/detalhes internos.
- Padrão de ouro a copiar: `test/analysis-flow.e2e-spec.ts` (sucesso, UUID inválido, falhas seguras, findings V2), `test/project-input.e2e-spec.ts` (matriz de inputs), `test/demo.e2e-spec.ts` (demo com GitHub indisponível).

## Launcher (`node --test`)

- Testes de unidades puras em `scripts/start-project.test.mjs` (versões Node, taskkill, seleção de porta, targets do proxy) — sem subir servidores.
- `--smoke` é ensaio real (clone + análise): exige internet e git; não roda offline.

## CI (referência)

`.github/workflows/compatibilidade.yml`: matriz macOS/Linux/Windows, Node 24, `npm ci` raiz+backend, launcher, `--check`, wrapper do OS, todos os testes/lint/builds, `--smoke`. Sem deploy. Mudanças de build/test devem refletir nesse workflow.

## Gotchas

- Backend tem `.oxlintrc.json` com `no-floating-promises: error` — lint pode passar no TS e falhar no lint.
- `test:e2e` pode depender de rede em fluxos de clone; e2e de contrato usa mock — diferencie o que você está rodando.
- Portas: launcher escolhe portas livres a partir de 3000/4200; conflito de porta em dev use `--check` primeiro.
- `dist/` raiz é build de produção (não há publicação automática): não use como evidência de teste; evidência de build = saída do `npm run build`.

## Referências

- `references/troubleshooting-validacao.md` — falhas comuns e correção.
- `docs/inicializacao.md` (raiz do repo).
