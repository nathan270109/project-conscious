---
name: nestjs-backend
description: Trabalha no backend NestJS 12 do Project Conscious (backend/). Use quando criar/alterar módulos, controllers, services, DTOs, coleta git, CORS, demo, testes de backend ou o fluxo de análise de repositórios. NÃO use para frontend Angular, infra Terraform ou launcher.
---

# Backend NestJS — Project Conscious

NestJS 12, ESM (`type: module`, `moduleResolution: nodenext`), TypeScript `strict`, Vitest (unit + e2e com supertest), oxlint type-aware. Sem persistência: tudo em memória (decisão documentada).

## Fluxo de trabalho

1. Leia o módulo alvo em `backend/src/` (cada módulo: `*.module.ts` + controller + service + specs colados).
2. Controllers **finos**; lógica em services; erros de domínio viram respostas HTTP seguras na borda.
3. Valide: em `backend/` rode `npm test`, `npm run test:e2e`, `npm run lint`, `npm run build`. Corrija até passar.
4. Se mudar contrato HTTP: atualize `docs/api-contract.md` e os e2e de contrato.

## Regras obrigatórias

- Validação de entrada por DTO (`class-validator`/`class-transformer`); `ValidationPipe` global já em `backend/src/main.ts:24-34` (`whitelist`, `forbidNonWhitelisted`, `transform`, sem vazar `validationError` no corpo). Pipe nova deve usar `APP_PIPE` no module, não `useGlobalPipes` sem DI.
- **Nunca vazar detalhes internos em erros HTTP**: falha de análise = corpo `FAILED` com código `REPOSITORY_NOT_FOUND` (404) ou `ANALYSIS_FAILED` (500), conforme `docs/api-contract.md` e `project-analysis.service.ts:43-62`.
- Coleta de repositório: **apenas** `GithubService.withRepositoryFiles` (`github/github.service.ts`). Clone `--bare --depth=1` em `backend/.analysis-tmp/scan-*/`, limpeza garantida em `finally`, aborto no `onModuleDestroy`. Respeite `CLONE_LIMITS` (45s, 100MiB, 10k entries, 2k arquivos, 1MB/arquivo, concorrência 2).
- Processo git: sempre via `github/git-command.ts` (execFile, sem shell, sem credenciais/config do usuário, kill de grupo, limite de output). Nunca `exec`/`spawn` com shell.
- URLs aceitas somente `https://github.com/owner/repo` sem credenciais/porta/query/fragment (`github/repository-url.ts`) — reuso no DTO via validador custom `githubRepositoryUrl`.
- Testes: Vitest; unit `*.spec.ts` colado ao código; e2e em `backend/test/*.e2e-spec.ts` com `@nestjs/testing` + supertest; validação com `validateAnalysisResult` (`analysis/analysis-result.validator.ts`).
- oxlint type-aware; `no-floating-promises` é **error** — promessas soltas são bug aqui.
- Nenhum segredo commitado. CORS em `backend/src/config/cors.ts`: loopback liberado por padrão + env `CORS_ORIGINS`.

## Módulos e fluxo de análise

```
app.module.ts → ObserveModule(telemetria), GithubModule, ProjectsModule, AnalysisModule, DemoModule
Projects: POST /projects (cadastro em memória) → POST /projects/:id/analyze
AnalysisModule: 5 analyzers (DOC/TEST/A11Y/ORG/MAINT) + RepositoryProfiler + engine (DI via token ANALYSIS_ENGINE)
Scoring → Risks (ordenação) → Insights → validateAnalysisResult
Demo: GET /demo/analysis → backend/src/demo-data/analysis-result.json
```

Detalhes de regras/penalidades: skill `analise-v2-dominio` e `docs/analise-v2.md`.

## Gotchas

- **Sem `setGlobalPrefix('api')`** — e não adicionar: o `/api` é removido pelo proxy do Angular. Confundir isso quebra o contrato.
- README do backend está desatualizado em pontos (menciona Octokit/GITHUB_TOKEN e limites antigos 300 linhas/6 dirs; o real é clone git sem token e 400 linhas/8 níveis). Confie no código + `docs/`, não nessas partes do README.
- `app.module.ts` tem placeholder `appKey/appSecret` do ObserveModule ('YOUR_APP_KEY') — template, não segredo; não trate como credencial.
- Classificação de erro do git (`classifyError` em `github.service.ts`) casa regex em **inglês** na mensagem do git — cobrir variações de mensagem nos testes ao tocar ali.
- `.oxlintrc.json` desliga `no-explicit-any` — mesmo assim, evite `any`; o padrão do projeto é sem.
- Timeout do clone não cobre a fase de análise do motor; consumer define o tempo total da operação.
- Backend reiniciado perde tudo (em memória): e2e de demo cobre rota disponível com GitHub indisponível; não "corrigir" persistindo sem decisão de arquitetura (`docs/coleta-clone-temporario.md`).

## Referências

- `references/nestjs-arquitetura.md` — boas práticas NestJS 2026 e onde o projeto segue/diverge.
- `docs/api-contract.md`, `docs/coleta-clone-temporario.md` (raiz do repo).
