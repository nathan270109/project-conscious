# AGENTS.md — Project Conscious

Instruções para agentes de IA (Codex, Claude Code, Cursor, Copilot, Gemini CLI, opencode etc.) trabalhando neste repositório. Siga também as skills em `.agents/skills/` quando a tarefa for específica de uma área.

## Visão geral do projeto

**Project Conscious**: aplicação que analisa a qualidade de repositórios GitHub públicos e gera um "Conscious Score" (0–100) com base em **cinco dimensões**: documentação, testes, acessibilidade, organização e manutenibilidade.

- **Frontend**: Angular 22 (standalone, zoneless, signals, novo control flow `@if`/`@for`, Vitest) na raiz.
- **Backend**: NestJS 12 (ESM, `strict`, Vitest + supertest, oxlint) em `backend/`. Análise real via `git clone --bare --depth=1` de repositórios públicos (sem Octokit, sem token).
- **Infra**: Terraform em `infra/` — S3 + CloudFront (site), API Gateway HTTP + Lambda Python (chat de IA via Bedrock Mantle). Deploy manual.
- **Launcher**: `scripts/start-project.mjs` (multiplataforma, testado com `node --test`).
- **Docs**: fonte da verdade em `docs/` — especialmente `api-contract.md` (contrato backend↔frontend) e `analise-v2.md` (motor de análise).

## Comandos essenciais

| O que | Onde | Comando |
|---|---|---|
| Subir tudo (backend + frontend) | raiz | `npm run conscious:start` |
| Diagnóstico de pré-requisitos | raiz | `npm run conscious:start -- --check` |
| Ensaio E2E completo (exige internet) | raiz | `npm run conscious:start -- --smoke` |
| Backend em modo watch | `backend/` | `npm run start:dev` |
| Frontend | raiz | `npm start` |
| Testes backend (unit) | `backend/` | `npm test` |
| Testes backend (e2e) | `backend/` | `npm run test:e2e` |
| Lint backend | `backend/` | `npm run lint` |
| Testes frontend | raiz | `npm test -- --watch=false` |
| Build frontend | raiz | `npm run build` |
| Build backend | `backend/` | `npm run build` |
| Testes do launcher | raiz | `npm run test:launcher` |

**Antes de finalizar qualquer tarefa, valide com os comandos relevantes acima** (no mínimo: `npm test -- --watch=false` + `npm run build` na raiz; `npm test`, `test:e2e`, `lint` e `build` em `backend/` quando tocar no backend).

## Estrutura

```
src/app/            # Frontend Angular
  app.ts|config.ts|routes.ts
  components/       # header, footer (compartilhados)
  core/models/      # tipos + type guard de contrato (analysis-result.guard.ts)
  core/services/    # analysis.service.ts, ai-chat.service.ts
  core/testing/     # fixtures (analysis.fixture.ts) — ÚNICA fixture permitida
  feats/            # features roteadas: home, login, projects, not-found
backend/src/        # NestJS
  projects/         # controllers, services, DTO (cadastro + análise)
  github/           # clone git bare via child_process sandboxado (git-command.ts)
  analysis/         # motor: 5 analyzers + profiler + validator
  scoring|risks|insights/  # pós-processamento do resultado
  demo/ + demo-data/       # modo demonstração (JSON salvo)
  config/cors.ts
infra/              # Terraform (S3, CloudFront, API Gateway, Lambda)
scripts/            # launcher multiplataforma + testes
docs/               # documentos de arquitetura e contrato
```

## Regras de código (frontend)

- Componentes **standalone**; **sem NgModules**; injeção com `inject()`, nunca constructor.
- Estado com **signals** (`signal`, `computed`); preferir `input()`/`output()` em código novo. Evitar `@ViewChild` decorator — usar `viewChild()` signal-based.
- **Zoneless**: o app não tem zone.js. Mudanças de estado precisam notificar o Angular (signal, `markForCheck`, eventos de template). Não introduzir zone.js.
- Novo control flow: `@if`/`@for (… track …)`/`@switch`; nada de `*ngIf`/`*ngFor` em código novo.
- Classes e arquivos **sem sufixos** (`ProjectForm`, `project-form.ts`), seletores `app-*`.
- Serviços `providedIn: 'root'` com `inject(HttpClient)`; validação de resposta com o type guard `isAnalysisResult` de `core/models/analysis-result.guard.ts` antes de consumir qualquer payload HTTP.
- **Nada de `any`**; TypeScript com flags extras (`noImplicitOverride`, `noImplicitReturns`, `isolatedModules`…).
- Requests: timeout explícito por operação (padrão atual: 60s análise, 35s chat), erros mapeados em PT-BR, sem mock disfarçado de falha real. Fixture ilustrativa só em `core/testing/analysis.fixture.ts`.
- CSS: tokens do design system em `src/styles.css` (`:root`); guia em `docs/design-system.md`. Não criar cores/sombras ad-hoc fora dos tokens.

## Regras de código (backend)

- **NestJS 12, ESM** (`type: module`, `moduleResolution: nodenext`), `strict: true`.
- Controllers finos; lógica em services; validação de entrada com DTOs (`class-validator`/`class-transformer`) e `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) já configurado em `backend/src/main.ts`.
- Nunca expor detalhes internos em erros HTTP: falhas de análise viram corpo `FAILED` seguro (`REPOSITORY_NOT_FOUND` / `ANALYSIS_FAILED`), conforme `docs/api-contract.md`.
- Coleta de repositório: **somente** `GithubService.withRepositoryFiles` (clone bare temporário em `.analysis-tmp/scan-*`, limpeza garantida em `finally`). Respeitar `CLONE_LIMITS` (timeout 45s, 100MiB, etc.). Não usar `exec`/shell — sempre `git-command.ts` (execFile, sem credenciais, abort por kill de grupo).
- Testes: Vitest, specs colados ao código (`*.spec.ts`), e2e em `backend/test/*.e2e-spec.ts` com supertest. Respostas do motor validadas com `validateAnalysisResult`.
- Lint: **oxlint** com `--type-aware` (`.oxlintrc.json`). `no-floating-promises` é error.
- Nenhum segredo commitado. `CORS_ORIGINS` é env; CORS permite loopback por padrão (ver `backend/src/config/cors.ts`).

## Contrato e domínio (não quebre)

- `docs/api-contract.md` é a fonte única da verdade das rotas (`POST /projects`, `POST /projects/:id/analyze`, `GET /demo/analysis` via proxy `/api/...`). Mudanças na API exigem atualizar esse doc, o type guard do frontend e os e2e de contrato.
- Formato do resultado: `AnalysisResult` com `dimensions[]`, `findings[]` (ruleIds DOC/TEST/A11Y/ORG/MAINT + severidade CRITICAL/HIGH/MEDIUM/LOW) e `insight`. Penalidades 40/25/10/5; score = média das 5 dimensões, clamp 0–100 (`docs/analise-v2.md`).
- O backend **não persiste** nada: projetos/análises são em memória (documentado — não "corrigir" sem decisão de arquitetura).
- O frontend mantém a mesma origem via proxy: `/api/**` → `http://127.0.0.1:3000` (rewrite remove `/api`); `/api/ai/**` → CloudFront da Lambda de IA (`proxy.conf.json`). Não liberar CORS global no backend para "resolver" isso.
- Modo demo é explícito: `GET /demo/analysis` devolve `backend/src/demo-data/analysis-result.json`; abrir o demo não faz HTTP no frontend.

## Estilo e convenções

- Prettier: raiz `printWidth: 100`, `singleQuote`; backend tem o próprio `.prettierrc` (`trailingComma: all`).
- `.editorconfig`: UTF-8, indent 2, LF; `.gitattributes`: `*.sh`/`*.command` LF, `*.cmd` CRLF — não "normalizar" esses arquivos.
- **Idioma**: código, comentários e mensagens de erro em português, consistente com o resto do projeto. Commits no padrão atual (`feat:`, `fix:`, `style:`, `merge:…` em PT-BR, lowercase).
- Jira do projeto usa keys `CONSCIOUS-*` — referencie quando fizer sentido.

## Gotchas (erros que agentes costumam cometer aqui)

- **Não confundir proxy com CORS**: `/api` é removido pelo proxy do Angular; as rotas do backend NÃO têm `setGlobalPrefix('api')`. Não adicionar.
- **Node/TypeScript atuais**: Angular 22 exige TS 6 e Node 24.x/22.22.x. Não "dar downgrade" de versões para resolver erro de instalação.
- **`dist/` raiz é build de produção** lido pelo Terraform para publicar no S3 — não commitar, não editar, não limpar antes de um `npm run build` que a publicação dependa.
- **Não persistir em banco "por conveniência"** nem trocar clone git por API do GitHub: decisões de arquitetura já documentadas em `docs/coleta-clone-temporario.md`.
- Erros de classificação do git dependem de mensagem em inglês (`github.service.ts` regex em `classifyError`) — mudanças ali precisam cobrir mensagens variadas no teste.
- Scripts `.sh`/`.cmd` devem manter line endings do `.gitattributes`; editar com cuidado.
- CI (`.github/workflows/compatibilidade.yml`) roda a matriz macOS/Linux/Windows com os mesmos comandos da seção acima; **não há deploy no CI**.

## Skills

Skills aprofundadas por área em `.agents/skills/` (padrão open Agent Skills, SKILL.md + references/):

- `angular-frontend` — convenções, zoneless, signals, testes e design system do frontend
- `nestjs-backend` — módulos, DTO, erros, coleta git e limites do backend
- `analise-v2-dominio` — motor de análise: dimensões, analyzers, scoring, findings
- `testing-validation` — como rodar e escrever testes em todas as camadas
- `infra-aws-terraform` — S3/CloudFront/Lambda, state remoto e deploy manual
