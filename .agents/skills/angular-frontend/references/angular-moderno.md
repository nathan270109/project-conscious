# Angular moderno (v20–v22) — boas práticas e onde o projeto está

Fonte: angular.dev (zoneless, roadmap), guidelines da comunidade 2026. Use para decidir padrões em código novo e avaliar divergências.

## Padrões que o projeto segue (mantenha)

| Prática | Onde no projeto |
|---|---|
| Standalone sem NgModule | todos os componentes (`src/app/`) |
| `inject()` em vez de constructor | services e componentes |
| Novo control flow `@if`/`@for` track | todos os templates |
| Signals para estado (`signal`, `computed`) | `App`, `Header`, `ProjectForm`, `ProjectScanning` |
| Zoneless sem zone.js | `package.json` sem zone.js, angular.json sem polyfills |
| Vitest como runner | `@angular/build:unit-test` |
| Estrutura por feature (`core/` + `feats/`) | `src/app/` |

Angular 22: zoneless é default (v21+) e **OnPush é o default para componentes novos** (v22). Novos componentes devem omitir estratégia explícita (herdam OnPush) ou declará-la; leitura de signal no template marca o componente automaticamente.

## Ordem de membros em componentes (convenção do projeto)

1. campos `static` → 2. inputs/outputs → 3. dependências injetadas (`readonly x = inject(X)`) → 4. estado interno → 5. accessors/computed → 6. lifecycle hooks → 7. métodos públicos → 8. métodos privados.

## Signals vs RxJS (decisão rápida)

- Estado do componente e valores derivados → `signal`/`computed`/`linkedSignal`.
- Debounce, retry, cancelamento, coordenação de streams → RxJS (`timeout`, `retry`, `takeUntilDestroyed`).
- Bridge → `toSignal()`/`toObservable()`. `httpResource()` é para leitura (GET); mutações (POST) continuam no `HttpClient` com Observable — é o que os services do projeto fazem hoje.

## Divergências do projeto (conhecidas, não "conserte" sem PR dedicado)

1. `ProjectDashboard` usa `@ViewChild` decorator + estado não-signal + `markForCheck()` manual (`project-dashboard.ts:19,34-45,122,130`). Regra: em edições pontuais use signals; migração completa é PR separada.
2. Rotas sem lazy loading (`app.routes.ts` — todos `component:` direto). Se adicionar rota nova pesada, use `loadComponent` para ela.
3. Sem interceptors; validação de contrato nos operadores dos services (padrão aceito).
4. Formulário é template-driven (`NgForm`/FormsModule). Signal Forms (estável em v22) é opção para código novo, mas não reescreva o form existente sem decisão.
5. Sem SSR/`@defer` (SPA pura de dev). Não adicionar SSR sem decisão de arquitetura (hoje o launcher servidor local serve o build estático).
6. `strict` não está declarado no tsconfig raiz (herda defaults do ng new) — manter flags como estão; não "relaxar".

## Performance / acessibilidade

- Pipe puro + `computed` em vez de método chamado no template (método roda a cada CD).
- `[class.x]`/`[style.x]` em vez de ngClass/ngStyle.
- `@defer` para trechos pesados quando caber (ex.: seção de vídeo da home).
- WCAG AA é requisito do design system (`docs/design-system.md`); tokens em `src/styles.css`.

## Testes zoneless

- `TestBed` roda zoneless por padrão. Preferir `await fixture.whenStable()` a `detectChanges()` forçado; mocks com `vi.spyOn`; `HttpTestingController` para HTTP; `RouterTestingHarness` para navegação.
