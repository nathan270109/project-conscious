# NestJS — arquitetura e boas práticas 2026 (vs. este projeto)

Fonte: docs.nestjs.com + guias da comunidade 2026. Para decidir padrões em código novo.

## Padrões adotados aqui (mantenha)

| Prática | Onde |
|---|---|
| Estrutura por feature (módulo = controller + service + dto + specs) | `src/projects`, `src/github`, `src/demo`… |
| Controllers finos; serviços falam linguagem de domínio | `projects.controller.ts`, `project-analysis.service.ts` |
| DTO na borda HTTP, validado por pipe; services sem decorators HTTP | `dto/create-project.dto.ts` |
| `whitelist` + `forbidNonWhitelisted` + `transform` (anti mass-assignment) | `main.ts:24-34` |
| Erros: service lança erro de domínio; borda traduz p/ HTTP seguro | `project-analysis.controller.ts:27-34` |
| Timeouts e limites explícitos em I/O externo | `CLONE_LIMITS` |
| Specs colados + e2e de contrato com supertest | `backend/test/` |

## Como o projeto diverge (e por quê — não mudar sem decisão)

1. **Sem exception filter global.** A tradução de erros está centralizada nos services (FAILED seguro). Uma alternativa "padrão" seria `GlobalExceptionFilter` + envelope único `{ error: { code, message } }`; aqui o envelope é o corpo `FAILED` do contrato. Se adicionar filter, ele deve preservar esse formato — nunca vazar stack/valores.
2. **Sem banco / em memória.** Documentado em `docs/coleta-clone-temporario.md` e no contrato. Não introduzir persistência por conveniência.
3. **Sem prefixo global `/api`.** O proxy do Angular remove o prefixo; adicionar `setGlobalPrefix` duplicaria.
4. **Sem `@nestjs/config`/env schema** (apenas `CORS_ORIGINS`). OK para o escopo atual; se env crescer, introduzir schema validado.
5. `github.service.ts` concentra coleta + limites + leitura (~276 linhas). Extração por função (readFiles, watcher, limits) é refatoração aceitável — mas mantenha `withRepositoryFiles` como única porta de entrada.

## Regras transversais úteis aqui

- Interceptor = sucesso/transversal; filter = falha. Não trocar.
- Transação/limpeza de recurso externo: um único dono do ciclo de vida (aqui: `GithubService` é dono do clone e da limpeza em `finally`).
- `ParseUUIDPipe` para `:id`; DTO com `@Transform` para trim; validador custom reusa parser puro — teste o parser isoladamente.
- `ClassSerializerInterceptor`/`@Exclude()`: use se surgirem objetos internos retornados por engano; hoje o fluxo já monta objetos de resposta explícitos.

## E2E de contrato (padrão de ouro deste repo)

- Subir `AppModule` real com `overrideProvider` no `GithubService` (mock de arquivos) — ver `test/analysis-flow.e2e-spec.ts`.
- Matriz de inputs inválidos/aceitos — ver `test/project-input.e2e-spec.ts`.
- Falha simulada → corpo `FAILED` sem detalhes internos.
- Demo disponível com GitHub "fora" — `test/demo.e2e-spec.ts`.
