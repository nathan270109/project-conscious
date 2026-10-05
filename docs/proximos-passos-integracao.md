# Próximos passos — integração da API do Project Conscious

Referência: 28/09/2026. Este guia registra o estado verificado nessa data; confirme novas entregas antes de integrar código.

### Aceite final da integração — 05/10/2026

Estado atual conferido na master `b4af205`, após merge da
[PR #61](https://github.com/nathan270109/project-conscious/pull/61).
CONSCIOUS-39 e CONSCIOUS-47 já constam como Feito, e a história CONSCIOUS-12
também está Feito. CONSCIOUS-49, sua história CONSCIOUS-13 e o épico
CONSCIOUS-5 continuam Fazendo. A consulta foi somente de leitura.

Esta revisão está na branch `docs/entrega-integracao`, na mesma pasta original.
Atualiza `backend/README.md`, que ainda descrevia motor, dashboard e demo como
pendentes. Inclui comandos completos de cadastro/análise/demo, proxy Angular,
respostas, limitações de memória e distinção entre resultado atual e salvo.
Corrige também a indicação antiga de `GET /`: essa rota não está registrada;
`GET /demo/analysis` permite verificar a API inicializada.

#### Evidência de aceite da CONSCIOUS-49

| Critério | Evidência conferida |
| --- | --- |
| Cadastro e análise pelo mesmo UUID | Ensaio real: POST /projects 201, análise 200 para o UUID retornado |
| Leitura de arquivos públicos | GET /projects/:id/files 200; README, misc/data.ts, src/Utils.ts, src/app.html e src/app.ts |
| Cinco analisadores e serviços reutilizados | RepositoryAnalysisEngine + teste analysis-flow.e2e-spec.ts pelo AppModule |
| Resultado completo e contrato de insight | Score 74, cinco categorias distintas, dez findings, insight category/title/message |
| Erros de ID e projeto | Ensaio real: UUID inválido 400 e projeto inexistente 404 |
| Falhas externas e do motor | Testes E2E: FAILED seguro, sem dados internos, sem COMPLETED parcial |
| Consumo Angular e proxy | PR #60 integrada; formulário usa UUID recebido e dashboard preserva os dados |
| Contingência e alinhamento | PR #61 integrada; mesmo JSON no backend/Angular, demoMode true e seleção explícita |
| Documentação de consumo | README principal, backend/README.md e docs/api-contract.md |

Ensaio realizado em API temporária na porta 3001, com GitHub real e o demo oficial.
UUID do ensaio: `923bd275-b96f-473b-9713-5720a0c7aa35`. Esse cadastro era apenas
em memória e deixa de existir ao encerrar a API temporária.
A chamada de análise ao vivo usou `demoMode: false`; GET /demo/analysis retornou
200 com `demoMode: true` e identidade exclusiva. A API temporária foi encerrada
após a conferência. A análise ao vivo consulta a branch padrão; o resultado salvo
continua vinculado à revisão fixa documentada abaixo.

Nesta revisão, build backend e os 15 testes E2E passaram novamente.
Os 127 testes unitários, 54 testes Angular, lint backend e builds já haviam
passado na entrega do demo, cujo código foi integrado sem alterações nesta master.
Esta branch altera somente documentação.

#### Publicação desta revisão

1. Revise `git diff` e faça `git diff --check`.
2. Faça commit: `docs: atualiza entrega e aceite da integração`.
3. Publique `docs/entrega-integracao` e abra PR para master.
4. Após merge da documentação, registre as evidências na CONSCIOUS-49 e marque
   essa tarefa como Feito. As implementações estão nas PRs #58, #60 e #61.
5. Confira o encerramento das subtarefas da CONSCIOUS-13 e das histórias do
   épico CONSCIOUS-5 antes de concluir esses itens maiores. Não é necessário
   criar outra implementação da API.

Comentário sugerido para CONSCIOUS-49 após integrar esta documentação:

> Integração concluída nas PRs #58, #60 e #61. POST /projects cadastra o projeto
> e POST /projects/:id/analyze usa o mesmo UUID, executa os cinco analisadores e
> reutiliza scoring, ordenação dos riscos e insight. Ensaio com o repositório
> público oficial do demo retornou 201/200, score 74, cinco dimensões e dez
> findings. IDs inválidos retornam 400; projetos inexistentes retornam 404.
> Os 15 testes E2E passaram, incluindo falhas externas e do motor com FAILED
> seguro. Consumo Angular, proxy e demo salvo estão integrados e documentados.
> Resultado ao vivo usa demoMode false; demonstração salva usa demoMode true.

#### Ensaio final com a equipe

1. Prepare dependências antes de ficar sem internet. Na raiz, inicie `npm start`;
   em outro terminal, entre em backend e inicie `npm run start:dev`.
2. Em `/projects/new`, cadastre `Project Conscious Demo` com
   `https://github.com/katherinykamili/project-conscious-demo` e execute a análise.
3. Confira o resultado atual: cinco dimensões, riscos na ordem recebida e insight.
   Na revisão pública conferida hoje, score 74, dez findings e acessibilidade 40.
4. Mostre a imagem sem alt em src/app.html:4 e sua relação com a primeira ação
   do insight. Explique que as regras apontam sinais e têm limitações, inclusive
   a detecção de descrição curta do README.
5. Volte ao formulário e escolha **Abrir demonstração salva**. Confira selo,
   repositório, revisão e data. Recarregue para mostrar que o demo continua disponível.
6. Pare apenas o backend iniciado para o ensaio e repita a abertura do demo.
   A aplicação Angular local precisa continuar ativa.
7. Combine com Matheus a explicação das regras de score/prioridade e com Letícia
   a apresentação do dashboard. Reserve uma pessoa para conduzir o cadastro e
   a troca explícita para a análise salva.

Melhorias de regras, autenticação e persistência precisam de escopo próprio.
Não são pendências de implementação da CONSCIOUS-49.

### Demonstração salva — 05/10/2026

Implementação local na branch `feat/demo-offline`, na pasta original do projeto,
baseada na master `e807487` após as PRs #59 (login) e #60 (consumo Angular).
As seções anteriores abaixo são registros históricos.

- Demo oficial confirmado no comentário da [CONSCIOUS-38](https://katherinykc13.atlassian.net/browse/CONSCIOUS-38): `https://github.com/katherinykamili/project-conscious-demo`.
- Revisão fixada: `2770289e71c3ea7ef0e89ba056f67ba99f4110ee`. Árvore pública completa (não truncada), cinco arquivos; bytes conferidos pelos hashes dos blobs Git.
- Motor real da master gerou o JSON `backend/src/demo-data/analysis-result.json`, com score 74, cinco dimensões, dez findings e insight de acessibilidade. Data da geração: `2026-10-05T18:31:40.811Z`.
- Snapshot dos arquivos e revisão do motor preservados em `backend/src/demo-data/repository-snapshot.json`; teste reproduz exatamente score, dimensões, findings e insight.
- `DemoService.getDemoAnalysis()` e `GET /demo/analysis` fornecem cópia do resultado salvo, sem consultar GitHub.
- Angular inclui o mesmo JSON no bundle. O link **Abrir demonstração salva** usa UUID exclusivo; funciona com o backend desligado, inclusive após recarga. Dashboard identifica o selo **Modo demonstração: análise salva**, repositório, revisão e data.
- Seleção explícita: falha em outro projeto continua sendo FAILED/erro. Nenhum cadastro ou resultado de usuário é substituído pela demonstração.
- Comparação automatizada da CONSCIOUS-47 verifica contrato e chaves do resultado salvo e da fixture ilustrativa. A fixture permanece restrita aos testes.
- Teste de login recém-integrado recebeu `provideRouter([])` para seus RouterLinks. Ajustes de apresentação limitados ao formulário/dashboard.

Validação: 127 testes unitários e 15 E2E do backend passaram; build e lint do
backend passaram. Angular: 54 testes passaram; build de produção passou.
No navegador, o demo abriu e foi recarregado com o backend desligado.
O teste Angular confirma ausência de requisições HTTP ao abrir esse dashboard;
o E2E simula GitHub indisponível e mantém a rota demonstrativa disponível.

Limitações verificadas: o offline requer o Angular/arquivos locais disponíveis;
não há service worker. O finding de descrição do README reflete a heurística
atual do analisador (palavras específicas); o README contém uma frase curta que
ela não reconhece. Também não há arquivo grande na revisão do demo: não inventar
esse finding. As regras da equipe foram mantidas e o resultado é a saída delas.

#### Próximos passos para publicar e encerrar

1. Confira `git status` e `git diff HEAD` nesta branch. Parte dos arquivos pode
   estar staged; inclua também as correções finais do formulário, testes e docs.
2. Faça o commit da entrega com `feat(demo): adiciona resultado local de contingência`.
3. Publique `feat/demo-offline` com `git push -u origin feat/demo-offline` e abra
   uma PR para `master`, relacionando CONSCIOUS-39/47 e a evidência da 45.
4. Na revisão, confirme que Matheus/Letícia concordam com a saída do motor e que
   o dashboard preserva o contrato. O alerta de README é limitação documentada,
   a avaliar em melhoria separada do analisador.
5. Após aprovação e merge, ensaie pelo formulário: abra **Abrir demonstração
   salva**, confira 74/100, cinco dimensões, dez riscos e insight, recarregue e
   repita com o backend desligado. Para a apresentação sem internet, prepare e
   inicie o servidor Angular local antes do ensaio.
6. Registre a PR e a evidência nas CONSCIOUS-39/47 e então marque essas tarefas
   como concluídas. A 45 já está Feito no Jira; acrescente a evidência do JSON.
   Nenhum status/comentário Jira foi alterado por esta implementação.

Reprodução automatizada, sem buscar novamente o GitHub:

```bash
cd backend
npm test -- demo.service.spec.ts
npm run test:e2e -- demo.e2e-spec.ts
cd ..
npm test -- --watch=false
npm run build
git diff HEAD --check
```

### Consumo Angular — 05/10/2026

Branch `feat/frontend-api-integration`, baseada na master após PRs #49 e #58.

- Formulário usa cadastro HTTP seguido da análise com o UUID retornado, mantendo o layout existente e mostrando progresso no próprio formulário (sem criar outra rota de scanning).
- Resultado real validado estruturalmente, guardado em memória e exibido pelo dashboard; preserva a ordem dos findings. Mock removido do fluxo de produção e mantido como fixture de testes.
- FAILED de HTTP 404/500 é distinguido do erro padrão NestJS. Cadastro inválido, rede, timeout e respostas incompatíveis não são tratados como sucesso.
- Proxy local `/api/**` documentado no README. Produção exige encaminhamento equivalente no servidor.
- Recarregamento/aba nova apresenta mensagem explícita de resultado ausente, sem inventar GET de resultado nem análise salva.
- Teste no navegador em 05/10/2026, via proxy e GitHub real: octocat/Hello-World abriu dashboard com UUID recebido, score 89, cinco dimensões e insight baseado em TESTS; menor nota DOCUMENTATION (70). Não é o demo da equipe nem uma análise de revisão Git fixada.
- Validação final: 49 testes Angular passaram em 15 arquivos, build passou e diff sem erros de whitespace. Repositório inexistente foi verificado no navegador com mensagem FAILED segura, sem score fictício. O estado de resultado ausente após recarga também foi observado.
- Revisar com responsáveis pelo cadastro e dashboard antes do merge; não houve mudança de status no Jira.

Próximo trabalho: gerar JSON real e rastreável do repositório-demo, implementar
contingência offline (39) e comparar fixture/resultado real/JSON (47). A revisão
final dos critérios da 49 deve considerar esta integração, não apenas o motor.

Os registros abaixo são históricos; os itens de consumo Angular da etapa H foram
implementados nesta branch, com as limitações de memória e produção acima.

### Motor conectado — 02/10/2026

Implementação na branch `feat/analysis-engine-integration`, criada sobre `0a343f8`
da PR #49. Essa resolução está publicada, mas ainda não estava na master ao
iniciar esta etapa. A PR do motor deve considerar essa dependência para não
misturar a revisão do frontend com a integração do backend.

- Motor concreto executa os cinco analisadores e reutiliza scoring, riscos e insight.
- Token ANALYSIS_ENGINE exportado; controller e serviço registrados no ProjectsModule.
- Rota POST /projects/:id/analyze disponível nesta versão da aplicação.
- Validação: 124 testes unitários e 13 E2E passaram; build e lint do backend passaram.
- Fluxo real com octocat/Hello-World em 02/10/2026: cadastro 201 e análise 200/COMPLETED, score 89, cinco dimensões, demoMode false.
- Pior dimensão: DOCUMENTATION (70); primeira ação: TESTS (finding HIGH). A diferença está corretamente refletida no insight.
- Esse teste acessou o GitHub real, mas não fixou a revisão do repositório e não é a evidência do repositório-demo da equipe. Nenhum JSON de contingência foi criado.

Próximo trabalho: coordenar CORS/proxy e consumo Angular, produzir o demo real
e validar sua contingência. Não encerrar CONSCIOUS-49/47/39 apenas com esta etapa.
As notas 100 das categorias sem findings representam as heurísticas executadas,
não certificação de qualidade ou cobertura completa do repositório.

As etapas históricas E/F e a validação do fluxo G descritas abaixo foram
implementadas nesta branch; não as repetir nem usar as antigas instruções de
rota inativa como estado atual.

### Conciliação da PR #49 — 02/10/2026

- Master incorporada localmente à branch do contrato; resolução preparada para commit, ainda sem publicação.
- Preservados `Project` e `ProjectDraft` da PR #52, com `createdAt: string` (ISO da API) e `description` opcional conforme o backend.
- Preservados textos, classes e fallback do insight da PR #46, já integrada, junto às dimensões em lista e ao tratamento de FAILED. Há apenas uma seção de insight.
- Corrigidos os testes de Footer e FAQ para os templates atuais; configurado o roteador no teste de Benefícios. Removido o import sem uso de RouterLink na FAQ, cujo botão foi removido pela entrega anterior.
- Validação final: 33 testes passaram em 14 arquivos; build Angular passou sem o aviso da FAQ; diff em relação à master sem erros de whitespace.
- Resolução disponível na pasta original `project-conscious`, branch `fix/frontend-analysis-contract`, pronta para commit.
- Antes do merge no GitHub: commitar e publicar a resolução, revisar o diff e as verificações remotas. A CONSCIOUS-47 permanece parcial até a comparação com o demo real.

Os registros abaixo são históricos e não substituem esta atualização.

### Atualização — CONSCIOUS-47, 29/09/2026

Implementação local na branch `fix/frontend-analysis-contract`, baseada na master após o merge da PR #48:

- Modelo do frontend alinhado aos estados COMPLETED/FAILED do backend: data obrigatória, dimensões em lista, finding com arquivo/linha e insight estruturado.
- Mock ilustrativo atualizado; os consumidores recebem cópias independentes. Não é evidência do repositório-demo nem resultado do motor real.
- Dashboard adaptado para cinco dimensões em lista, título/mensagem do insight e estado FAILED sem score ou mensagem de ausência de riscos.
- Dashboard preserva a ordem recebida. A ordenação definitiva por severidade/impacto continua pertencendo à CONSCIOUS-44; a ordem da fixture não implementa essa regra.
- Testes de contrato do mock e renderização adicionados/atualizados.

Validação desta etapa: build Angular passou; 13 testes específicos do serviço/dashboard passaram; `git diff --check` passou. A suíte completa ainda apresenta sete falhas por ausência de provider de `ActivatedRoute` nos testes de App, Header, Footer, Home, FAQ e Hero. As mesmas sete falhas foram reproduzidas em uma cópia temporária do commit-base `b36e5fc`, sem estas alterações. A suíte global não está verde; esses testes não foram modificados nesta entrega.

Coordenação: a PR #46 da Letícia ainda estava aberta na consulta. Esta branch altera o mesmo template por necessidade de compatibilidade; revisar as duas entregas juntas, preservando os estilos/textos dela e a renderização de `insight.title`/`insight.message`, sem duplicar a seção.

Pendências: API real (49), resultado real do demo (45/39) e comparação final desse JSON (47). A 45 consta como Feito no Jira, mas o JSON exigido por sua descrição não foi encontrado na master. Não encerrar a 47 com esta entrega parcial.

As seções abaixo preservam o plano original. Onde mencionam `feat/analysis-api-integration`, usar uma nova branch baseada na master atual: aquela entrega já foi integrada. A tabela da etapa B descreve as divergências anteriores a este alinhamento.

Tarefa principal: [CONSCIOUS-49 — Integrar motor de análise e expor resultado pela API](https://katherinykc13.atlassian.net/browse/CONSCIOUS-49).

Responsável: Katheriny Kamili, integrante 4.

## 1. Ponto de partida

- Branch: `feat/analysis-api-integration`.
- Tipos `AnalysisResult`, interface `AnalysisEngine` e token `ANALYSIS_ENGINE` criados.
- Serviço de orquestração, tratamento seguro de falhas e validação de categorias/notas implementados.
- Controller de `POST /projects/:id/analyze` criado e testado em aplicação isolada.
- Controller e serviço ainda não registrados no `ProjectsModule`; a rota não está ativa na aplicação principal.
- Última verificação: 118 testes unitários, 7 testes HTTP, build e lint do backend passaram, incluindo menor dimensão, empates e ação prioritária no insight.
- Etapa A implementada: contrato e README documentam a rota isolada, IDs, exemplos e erros HTTP.
- Etapa C implementada: validação runtime de estrutura, findings e insight, com testes de rejeição e conversão para FAILED seguro.
- Os cinco analisadores estão registrados e exportados pelo `AnalysisModule`, com teste de injeção em módulo consumidor.
- Testes/acessibilidade foram incorporados seletivamente da entrega do Matheus `b6fccb7a056b4379163945b2bd7c9957e0695272`, com correção e testes para IDs HTML com caracteres especiais.
- `InsightsService` e `InsightsModule` implementados e testados; ainda não conectados ao motor.
- O motor real ainda não está conectado. Os testes HTTP de análise simulam o serviço e não comprovam o fluxo completo.

## 2. Divisão de responsabilidades e dependências

| Trabalho | Responsável | Situação verificada |
| --- | --- | --- |
| Integração HTTP e orquestração — CONSCIOUS-49 | Katheriny, integrante 4 | Fazendo |
| Comparação entre contrato, mock e demo — CONSCIOUS-47 | Katheriny, coordenando com Letícia e Matheus | A fazer |
| Disponibilização do resultado local — CONSCIOUS-39 | Katheriny | A fazer |
| Analisadores de testes/acessibilidade — CONSCIOUS-41 | Matheus, integrante 5 | Código integrado localmente nesta branch; origem e correção registradas acima |
| Organização/manutenibilidade — CONSCIOUS-42 | Matheus | Disponíveis na master |
| Score — CONSCIOUS-43 | Matheus | Disponível na master |
| Ordenação dos riscos — CONSCIOUS-44 | Matheus | A fazer |
| Insight e resultado demonstrativo — CONSCIOUS-45 | Katheriny (atribuição atual consultada no Jira) | Fazendo; serviço e testes implementados; alinhamento da regra e demo real pendentes |
| Cadastro e scanning — CONSCIOUS-23 a 27 | Integrante 2 | Pendentes no Jira |
| Dashboard e consumo do resultado | Letícia, integrante 3 | Interface existente com mock; precisa alinhar contrato e consumo |

Katheriny conecta as entregas do motor. Regras de score e ordenação devem ser reutilizadas dos serviços do Matheus. A tarefa 45, agora atribuída a Katheriny no Jira, produz insight e resultado demonstrativo; a 39 o disponibiliza como contingência.

Consulta ao Jira em 28/09/2026: nenhuma transição foi realizada nesta revisão. A CONSCIOUS-44 permanece com Matheus em A fazer; 45 e 49 estão Fazendo; 39 e 47 estão A fazer. Não foi encontrado serviço de ordenação na revisão das branches; `feat/risk-radar` entrega a interface visual.

### O que pode ser encerrado no Jira

- As tarefas de Katheriny 34, 35, 36, 37, 38, 40, 46 e 48 já constam como Feito. Isso registra o estado do Jira, não uma nova auditoria manual do repositório-demo da 38.
- Nenhuma outra tarefa pendente desta integração está integralmente pronta para Feito.
- CONSCIOUS-45: regra local ajustada para menor nota como contexto e primeiro finding ordenado como ação, com empates determinísticos. Faltam comunicar a assinatura/interpretação aos consumidores e produzir o resultado demonstrativo real; não encerrar ainda.
- CONSCIOUS-39: falta JSON real, serviço de contingência e validação offline com dashboard.
- CONSCIOUS-47: o frontend ainda diverge do contrato, e o JSON real não está disponível.
- CONSCIOUS-49: faltam motor conectado, rota ativa, configuração/consumo frontend e validação real.
- Manter CONSCIOUS-13 aberta enquanto suas subtarefas 47/49 permanecerem pendentes; a entrega básica de cadastro/leitura não conclui essas integrações.

## 3. Etapa A — documentar o comportamento HTTP

Pode começar agora. Responsável: Katheriny.

Arquivos: `docs/api-contract.md` e `backend/README.md`.

1. Adicionar seção para `POST /projects/:id/analyze`.
2. Identificar a rota como **implementada em controller isolado, ainda não ativada na aplicação principal**.
3. Explicar que `id` deve ser UUID v4 devolvido por `POST /projects`.
4. Registrar que a requisição de análise não exige corpo no desenho atual.
5. Documentar esta tabela de respostas, correspondente ao controller atual:

| Caso | HTTP | Corpo |
| --- | --- | --- |
| Análise concluída | 200 | `AnalysisResult` com `status: COMPLETED` |
| ID malformado | 400 | Erro padrão de validação do NestJS |
| Projeto inexistente | 404 | Erro do `ProjectsService` |
| Repositório inexistente | 404 | `AnalysisResult` com `FAILED` e `REPOSITORY_NOT_FOUND` |
| Outras falhas de análise | 500 | `AnalysisResult` com `FAILED` e `ANALYSIS_FAILED` |

6. Incluir exemplos completos de sucesso e falha, mantendo os tipos existentes.
7. Explicar que o frontend lê `FAILED` no corpo da resposta HTTP de erro. Um 400 ou 404 de projeto inexistente não terá necessariamente o formato `AnalysisResult`.
8. Registrar que projetos são armazenados em memória e seus IDs deixam de existir após reiniciar o backend.
9. Incluir comandos de consumo para uso após a ativação:

```bash
curl -X POST http://localhost:3000/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Projeto exemplo","repositoryUrl":"https://github.com/octocat/Hello-World"}'

# Substitua UUID_RETORNADO pelo id recebido acima.
curl -i -X POST http://localhost:3000/projects/UUID_RETORNADO/analyze
```

Aceite: documentação corresponde ao controller e distingue rota planejada de rota ativa. Não marcar CONSCIOUS-49 como concluída nesta etapa.

## 4. Etapa B — alinhar o contrato entre integrantes

Pode começar agora. Relacionada à [CONSCIOUS-47](https://katherinykc13.atlassian.net/browse/CONSCIOUS-47).

1. Comparar `docs/api-contract.md`, tipos do backend e `src/app/core/models/analysis-result.model.ts`.
2. Registrar as diferenças atuais:

| Campo | Contrato publicado | Frontend atual |
| --- | --- | --- |
| `dimensions` | Lista de `{ category, score }` | Objeto com cinco propriedades |
| `insight` | `{ category, title, message }` ou `null` em falha | Texto |
| `analyzedAt` | Data ISO obrigatória | Ausente |
| `score` em falha | `null` | Apenas número |
| `error` | Obrigatório em `FAILED` | Ausente |
| `Finding.line` | Número ou `null` | Número opcional |
| `Finding.file` | Obrigatório | Opcional |

3. Combinar com Letícia a adaptação do modelo, mock e template do dashboard. Alterar o tipo sem adaptar os consumidores pode quebrar o build ou a renderização.
4. Comunicar a Matheus o formato já implementado de `Insight`: `category/title/message`. Conferir se o comentário da CONSCIOUS-45 foi corrigido; não usar `description/action/severity`.
5. Usar o contrato publicado como referência até uma mudança conjunta ser explicitamente acordada e documentada.
6. Comunicar as convenções aprovadas por Katheriny: menor nota como contexto, todos os empates em ordem fixa, primeiro finding ordenado como ação e categoria do insight. Sem findings, categoria convencional `DOCUMENTATION` e mensagem neutra. Confirmar o entendimento com Matheus e Letícia, sem apresentar essa categoria como deficiência.
7. Conferir o mock atualizado e, quando disponível, o JSON demonstrativo usando as mesmas regras.

Aceite parcial: todos concordam com o formato e os consumidores estão identificados. Aceite final da 47: mock, resposta real e JSON demo compatíveis; a comparação do demo permanece pendente enquanto o arquivo não existir.

## 5. Etapa C — fortalecer a validação da saída do motor

Pode começar agora. Responsável: Katheriny, no limite de validação da integração.

Arquivos: `backend/src/analysis/analysis-result.validator.ts` e testes relacionados.

1. Preservar as verificações existentes: cinco categorias distintas e notas finitas de 0 a 100.
2. Validar a estrutura em execução antes de acessar campos: TypeScript não valida objetos em runtime. Considerar receber `unknown` e estreitar os tipos com verificações explícitas.
3. Validar `findings` como lista; cada finding deve ter categoria e severidade conhecidas, mensagem e arquivo não vazios, e `line` nula ou inteiro positivo.
4. Validar `insight` com categoria conhecida, título e mensagem não vazios.
5. Garantir que resultado inválido se converta em `FAILED` seguro pelo serviço, sem retornar o conteúdo inválido ao frontend.
6. Adicionar testes para objeto ausente, campos ausentes, insight inválido, severidade desconhecida e linha inválida, além dos casos já existentes.
7. Não recalcular score nem gerar insight dentro do validador: essas regras pertencem ao motor.

Aceite: resultados incompatíveis com o contrato não recebem `COMPLETED`. Validar cinco notas não prova que cinco analisadores executaram; isso será testado na etapa E.

## 6. Etapa D — conferir entregas do motor e atualizar a base

Depende da integração das entregas do Matheus.

1. Testes/acessibilidade já foram revisados e integrados seletivamente nesta branch, preservando os cinco analisadores. Confirmar posteriormente o merge da entrega original na master; não reaplicar seus arquivos por cima das correções locais.
2. Aguardar o serviço de ordenação da CONSCIOUS-44 e conferir sua assinatura real. O insight está disponível como `InsightsService.generate(dimensions: readonly DimensionScore[], orderedFindings: readonly Finding[]): Insight`. Passar as dimensões do ScoringService e a lista ordenada, sem misturar as notas individuais dos analisadores.
3. Preservar seu trabalho com commits antes de atualizar a base.
4. Executar estes comandos **na raiz do repositório**, com árvore limpa:

```bash
git status
git fetch origin
git log --oneline HEAD..origin/master
git ls-tree -r --name-only origin/master -- backend/src
```

5. Quando as dependências estiverem na master, integrar a base à branch de trabalho:

```bash
git switch feat/analysis-api-integration
git merge origin/master
```

6. Se houver conflito, revisar os dois lados. Atenção especial a `analysis.module.ts` e `analysis.types.ts`: manter os cinco analisadores e todos os tipos acordados. Não substituir o módulo inteiro pela versão antiga de uma branch.
7. Executar testes e build após resolver a integração.

Aceite: os cinco analisadores, score, riscos e insight estão disponíveis na branch sem perder entregas existentes.

## 7. Etapa E — implementar o motor concreto

Responsável pela ligação: Katheriny. As regras de cada serviço continuam com seus autores.

1. Criar uma implementação de `AnalysisEngine` em `backend/src/analysis/`, por exemplo `repository-analysis-engine.service.ts`.
2. Injetar os cinco analisadores e os serviços reais de score, riscos e insight. Usar as assinaturas efetivamente entregues, não nomes presumidos.
3. Executar cada analisador sobre os arquivos recebidos e reunir seus findings.
4. Usar `ScoringService.calculate(findings)` para obter o score e as dimensões. Não misturar suas penalidades com as notas individuais dos analisadores.
5. Ordenar os findings com o serviço da CONSCIOUS-44 e gerar o insight com o serviço da CONSCIOUS-45, conforme o contrato alinhado.
6. Retornar `AnalysisEngineOutput`. O `ProjectAnalysisService` já acrescenta ID, data e status.
7. Testar que todos os cinco analisadores são chamados e que seus findings chegam aos serviços seguintes.
8. Testar que a falha de um analisador interrompe o resultado completo. Não atribuir nota perfeita a uma categoria que não foi analisada.

Aceite: o motor produz o resultado por meio dos serviços reais, sem duplicar regras ou usar respostas fixas.

## 8. Etapa F — registrar os módulos e ativar a rota

Somente após a etapa E.

1. Registrar a implementação concreta no módulo de análise.
2. Vincular `ANALYSIS_ENGINE` a essa implementação e exportar o token. Pode-se usar `useExisting` quando a classe já estiver registrada como provider.
3. Importar no módulo de análise os módulos que exportam os serviços de score, riscos e insight.
4. Importar o módulo que exporta `ANALYSIS_ENGINE` no `ProjectsModule`.
5. Adicionar `ProjectAnalysisService` aos providers do `ProjectsModule`.
6. Adicionar `ProjectAnalysisController` aos controllers, preservando `ProjectsController` e suas rotas existentes.
7. Manter dependências em uma direção: projetos usa o motor; o motor recebe arquivos e não precisa importar o módulo de projetos.
8. Iniciar a aplicação e confirmar que não há erro de resolução de dependências.
9. Atualizar a documentação para informar que a rota está ativa.

Aceite: `AppModule` inicia e a rota está disponível na aplicação principal.

## 9. Etapa G — testar o fluxo completo pela aplicação

1. Adicionar teste que importa `AppModule`, em vez de montar somente o controller isolado.
2. Simular apenas o acesso externo ao GitHub com arquivos controlados; manter o motor, analisadores e demais serviços reais.
3. Fazer POST `/projects`, capturar o ID e chamar POST `/projects/:id/analyze`.
4. Conferir cinco dimensões, score esperado, findings ordenados e insight coerente com a fixture.
5. Testar ID inválido, projeto inexistente e falha externa. Preservar as rotas antigas de cadastro e arquivos.
6. Executar, dentro de `backend`:

```bash
npm test
npm run test:e2e
npm run build
npm run lint
git diff --check
```

7. Fazer um teste manual com repositório público pequeno. Registrar data, repositório e resultado; esse teste depende da disponibilidade do GitHub.

Aceite: o fluxo funciona no módulo real; testes isolados com mock do serviço não substituem esta verificação.

## 10. Etapa H — integrar o frontend em coordenação

Responsáveis: integrante 2 no cadastro/scanning, Letícia no dashboard e Katheriny no contrato/configuração do backend.

1. Configurar CORS para a origem explícita do frontend ou proxy de desenvolvimento, conforme a estratégia combinada.
2. Fazer o cadastro usar POST `/projects` e preservar o UUID retornado pelo backend.
3. No scanning, chamar a rota de análise e tratar a resposta; encerrar a espera em sucesso ou falha.
4. Definir como o dashboard recebe o resultado: armazenamento em um serviço frontend ou uma futura rota de consulta. O backend atual não oferece GET de resultado de análise.
5. Substituir o mock fixo de ID `1` por dados do projeto real. Tratar recarregamento/resultado ausente de forma explícita.
6. Adaptar gráficos, cards e insight aos tipos alinhados na etapa B.
7. Tratar erros HTTP pelo corpo recebido, diferenciando erros padrão do NestJS e `AnalysisResult` com FAILED.
8. Validar o fluxo completo pelo navegador e conferir a exibição de erros.

Aceite: cadastrar um projeto leva ao resultado desse mesmo projeto, e falhas não deixam a interface carregando indefinidamente.

## 11. Etapa I — modo demonstração e encerramento

1. Receber o resultado demonstrativo baseado em evidências reais produzido na CONSCIOUS-45.
2. Disponibilizá-lo pela CONSCIOUS-39 e conferir compatibilidade pela CONSCIOUS-47.
3. Definir explicitamente a seleção do modo demo e os casos de contingência. Não trocar silenciosamente um repositório arbitrário pelos dados do repositório-demo.
4. Retornar `demoMode: true` e identificar na interface que os dados são de uma análise salva do repositório-demo.
5. Validar o fluxo sem acesso ao GitHub.
6. Atualizar README e contrato, anexar evidências de testes à PR e pedir revisão das fronteiras de integração aos responsáveis.
7. Conferir `git diff` e criar commits apenas dos arquivos da tarefa. Publicar na branch de trabalho; não fazer push direto na master.
8. Encerrar CONSCIOUS-49 somente após cumprir seus critérios de aceite e validar o fluxo real. Manter 39/47 abertas se suas entregas ainda estiverem incompletas.

## Checklist de acompanhamento

- [x] A — Comportamento HTTP documentado, mantendo aviso de rota ainda não ativa.
- [ ] B — Contrato alinhado com frontend e motor.
- [x] C — Validação de estrutura, findings e insight testada.
- [ ] D — Dependências integradas à base de trabalho.
- [ ] E — Motor concreto implementado usando os serviços existentes.
- [ ] F — Rota registrada e aplicação iniciando normalmente.
- [ ] G — Fluxo completo testado pelo AppModule e manualmente.
- [ ] H — Consumo pelo frontend validado com os responsáveis.
- [ ] I — Contingência coordenada, documentação e revisão concluídas.

A PR em rascunho já existe: https://github.com/nathan270109/project-conscious/pull/44.
Próxima ação: concluir B com Matheus e Letícia e receber a CONSCIOUS-44 para finalizar D. A e C foram implementadas localmente nesta revisão. Não ativar o motor nem marcar integração/demo como concluídos antes dessas dependências e dos testes das etapas E a I.
