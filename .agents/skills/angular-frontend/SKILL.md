---
name: angular-frontend
description: Trabalha no frontend Angular 22 do Project Conscious (raiz do repo, src/app). Use quando criar/alterar componentes, services, modelos, rotas, testes de frontend, design system ou configuração Angular (standalone, signals, zoneless, Vitest, proxy /api). NÃO use para backend NestJS ou launcher.
---

# Frontend Angular — Project Conscious

Aplicação de análise de repositórios GitHub. Angular 22.1, standalone, **zoneless (sem zone.js)**, signals, novo control flow, Vitest (`@angular/build:unit-test`).

## Fluxo de trabalho

1. Leia o componente/service mais próximo da tarefa em `src/app/` para copiar o estilo (convenções abaixo).
2. Escreva/edite o código seguindo as regras obrigatórias.
3. Rode `npm test -- --watch=false` e depois `npm run build` (na raiz). Corrija até passar — não finalize com falhas.
4. Se alterou o contrato HTTP, atualize `docs/api-contract.md` + `core/models/analysis-result.guard.ts` + specs e2e.

## Regras obrigatórias (não negociável)

- **Standalone only**; sem NgModules. Injeção com `inject()`, nunca constructor.
- **Zoneless**: NÃO introduzir zone.js nem `provideZoneChangeDetection`. Toda mudança de estado vista pelo template precisa de notificação explícita: signal, `markForCheck` ou evento de template.
- Estado com `signal`/`computed`; `input()`/`output()` (não `@Input()`/`@Output()`); `viewChild()` signal-based (não `@ViewChild`).
- Control flow novo: `@if`, `@for (… track …)`, `@switch`. Proibido `*ngIf`/`*ngFor` em código novo.
- Classes e arquivos **sem sufixo** (`ProjectForm` / `project-form.ts`), seletores `app-*`, membro `protected`/`readonly` quando só para o template.
- **Zero `any`**. `strict` + flags extras no tsconfig. Prettier raiz: `printWidth: 100`, `singleQuote`.
- HTTP: só em services `providedIn: 'root'` com `inject(HttpClient)`; timeout explícito por operação (60s análise, 35s chat); erros em PT-BR; validar payload com `isAnalysisResult` (`core/models/analysis-result.guard.ts`) antes de consumir.
- CSS: usar tokens de `src/styles.css` (`:root`); nunca criar cores/sombras ad-hoc fora dos tokens. Guia: `docs/design-system.md`.

## Arquitetura de pastas

```
src/app/
  app.ts|app.config.ts|app.routes.ts     # bootstrap + rotas flat
  components/    # header, footer (compartilhados)
  core/models/   # tipos + type guard + validação de URL
  core/services/ # analysis.service.ts, ai-chat.service.ts
  core/testing/  # analysis.fixture.ts — ÚNICA fixture permitida
  feats/         # features roteadas: home, login, projects, not-found
```

Rotas (`app.routes.ts`): `home`, `projects/new`, `projects/:id/scanning`, `projects/:id/dashboard`, `login`, `**` → not-found. Sem lazy loading hoje; se adicionar, prefira `loadComponent` — não reestruture tudo.

## Testes de frontend

- Vitest com `globals`; spec colado ao código, mesmo nome (`project-form.ts` → `project-form.spec.ts`).
- HTTP isolado com `HttpTestingController`; fluxos com `RouterTestingHarness`; navegação real com `navigateByUrl` + `whenStable`.
- Fixture de resultado: factory `createAnalysisFixture()` em `core/testing/analysis.fixture.ts`. Nada de mock de sucesso disfarçado de falha real.

## Gotchas

- Sem interceptors HTTP: validação/tratamento de erro vive nos operadores RxJS dos services. Não "resolva" adicionando interceptor global sem decisão de arquitetura.
- Cache de projetos é um `Map` em memória no `AnalysisService` — refresh perde tudo (limitação documentada, não bug).
- O proxy dev (`proxy.conf.json`) remove `/api` antes de chegar ao backend; o backend NÃO tem prefixo `/api`. `/api/ai/**` também vai para o backend local (`POST /ai/chat`, módulo `ai/` no NestJS).
- `ProjectDashboard` é legado misto (estado não-signal + `markForCheck`): ao tocar nele, siga as regras acima no que editar; migração completa é decisão de PR separada.
- `login` é stub (autenticação não existe); `feats.ts` é placeholder morto — não reutilize como base.

## Referências

- `references/angular-moderno.md` — boas práticas Angular 2026 (signals, zoneless, performance) e onde este projeto segue/diverge.
- `docs/design-system.md`, `docs/api-contract.md` (raiz do repo).
