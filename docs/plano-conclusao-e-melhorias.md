# Plano de conclusão e melhorias — Project Conscious

Data da análise: 05/10/2026. Base revisada: commit `ae125eb`, presente em `origin/master` e na branch local `docs/entrega-integracao`.

Este documento transforma a revisão do projeto em uma sequência executável. É um plano: as caixas desmarcadas não representam funcionalidades já implementadas. Responsáveis de novas melhorias são sugestões e precisam ser alinhados com o grupo antes da execução.

## 1. Situação de partida

O MVP já cadastra projetos na API, consulta o GitHub, executa cinco analyzers, calcula a pontuação, ordena findings, produz um insight e exibe o resultado no dashboard. Há uma demonstração com resultado salvo e rastreável.

Na revisão, passaram 54 testes do frontend, 127 testes unitários do backend e 15 testes E2E do backend. Os builds e o lint do backend também passaram. Esses resultados são uma fotografia da revisão, não dispensam novas verificações após cada mudança.

Os testes não substituem uma execução completa no navegador: o frontend usa ambiente simulado e os E2E do backend simulam o GitHub. A responsividade completa não foi comprovada nessa análise.

### Entregas identificadas

| Integrante | Entregas incorporadas ao projeto |
| --- | --- |
| Katheriny — integrante 4 | Backend NestJS, GitHub, cadastro, tratamento de falhas, contrato, DocumentationAnalyzer, orquestração, validação dos resultados, integração do motor e da interface, ajustes dos modelos/mock, demo offline, documentação e correções de testes. |
| Nathan — integrante 2 | Header/menu, estrutura e ajustes do formulário, BEM, modelos de projeto e parte da navegação. Scanning ainda pendente. |
| Eduardo — integrante 1 | Landing page, contribuições visuais no header/footer e tela de login. Navegação, responsividade e acessibilidade ainda precisam ser concluídas. |
| Letícia — integrante 3 | Dashboard, score, dimensões, Risk Radar, estados de erro/ausência e apresentação do insight; modelos e mock iniciais. |
| Matheus — integrante 5 | Analyzers de organização, manutenibilidade, testes e acessibilidade; pontuação e riscos; contribuições no footer. |

A atribuição considera código e histórico, não somente autoria do merge. A CONSCIOUS-45 está atualmente atribuída a Katheriny e concluída.

### Jira na data da revisão

- As tarefas de Katheriny CONSCIOUS-34 a 40 e CONSCIOUS-45 a 49 constam como **Feito**. As melhorias deste plano não reabrem automaticamente essas entregas.
- Entre as 34 subtarefas, 27 estão concluídas e 7 estão em **A fazer**.
- Pendências de Eduardo: CONSCIOUS-19, 20 e 22.
- Pendências de Nathan: CONSCIOUS-24, 25, 26 e 27.
- A CONSCIOUS-47 tinha uma sinalização antiga de impedimento na revisão inicial. Ela foi removida em 05/10/2026 a pedido de Katheriny; a tarefa permanece **Feito**, sem alteração de responsável.
- Não usar um percentual somando épicos, histórias e subtarefas: isso contaria o mesmo trabalho várias vezes.

Links: [quadro de integração — CONSCIOUS-49](https://katherinykc13.atlassian.net/browse/CONSCIOUS-49), [cadastro — CONSCIOUS-24](https://katherinykc13.atlassian.net/browse/CONSCIOUS-24), [navegação — CONSCIOUS-19](https://katherinykc13.atlassian.net/browse/CONSCIOUS-19).

## 2. Regras para executar o plano sem prejudicar o grupo

1. Trabalhar no checkout aberto no VS Code: `/Users/katherinykamilicorrearocha/Documents/project-conscious`. Não criar uma cópia do projeto para realizar estas mudanças.
2. Conferir `git status` antes de trocar de branch. Preservar alterações existentes; não usar comandos de descarte para obter uma árvore limpa.
3. Cada entrega deve ter uma branch e uma PR de escopo pequeno. Os nomes abaixo são sugestões, não branches já criadas.
4. Antes de alterar arquivos compartilhados, combinar quem os editará. Atenção a `app.routes.ts`, formulário, modelos, header/footer e contrato.
5. Não substituir o ID criado pelo backend por um ID local. Não reintroduzir mocks no fluxo real.
6. Manter o contrato de sucesso e falha. Alterações incompatíveis exigem acordo, atualização da documentação e testes de ambos os lados.
7. Só concluir tarefas no Jira após cumprir seus critérios atualizados e anexar evidências. Novas melhorias exigem novas tarefas, não atribuição automática de pendências antigas.

Preparação, quando a árvore estiver limpa e a entrega anterior já estiver integrada:

```sh
cd /Users/katherinykamilicorrearocha/Documents/project-conscious
git status
git fetch origin
git switch master
git pull --ff-only origin master
git switch -c <nome-da-nova-branch>
```

Substituir o marcador pelo nome acordado. Se houver alterações locais ou divergência, resolver a situação antes de continuar, sem apagá-las.

## 3. Sequência de execução

### Passo 1 — Alinhar o escopo e atualizar as pendências

**Responsáveis:** grupo; Katheriny e Nathan para o fluxo da API. **Pré-requisito:** nenhum. **Entrega:** decisões registradas no Jira/documentação.

1. Conferir o estado atual das sete tarefas pendentes; o retrato acima pode mudar.
2. Atualizar a CONSCIOUS-24: hoje a API cria o projeto e seu ID. O serviço do frontend deve trabalhar com esse retorno, não manter um cadastro local concorrente.
3. Definir se `AnalysisService` será reaproveitado ou se haverá um `ProjectService` dedicado. Se separar, migrar responsabilidades com testes, sem duplicar chamadas e estado.
4. Revisar a branch `origin/feat/core` antes de reaproveitá-la. O `project-service.ts` encontrado está vazio; não é uma integração concluída. Conciliar mudanças de formulário/header com o código atual em vez de realizar merge automático.
5. Atualizar CONSCIOUS-25 a 27 para aguardar a API real. Decidir se a entrega usará indicador indeterminado ou se progresso real será uma nova tarefa de backend.
6. Registrar: são cinco dimensões; estrutura pode ser uma etapa preparatória, não uma sexta dimensão pontuada.
7. Decidir quais evoluções dos passos 9 a 13 são necessárias para a entrega final e quais ficarão no backlog.
8. Conferir a sinalização de impedimento da CONSCIOUS-47.

**Aceite:** nenhuma tarefa instrui a criar IDs conflitantes, apresentar progresso fictício ou assumir trabalho de outro integrante sem acordo.

- [ ] Passo 1 concluído e decisões registradas.

#### Registro do passo 1 — conferência realizada em 05/10/2026

**Estado atualizado:** conferência técnica concluída e descrições das CONSCIOUS-24 a 27 atualizadas no Jira a pedido de Katheriny. Posteriormente, Katheriny assumiu a implementação do fluxo na branch `feat/project-scanning-flow`: reutilização do `AnalysisService`, cadastro → scanning → dashboard e metadados/nome do projeto foram implementados e verificados. Responsáveis e status no Jira foram preservados; o código ainda depende de revisão e publicação. A decisão do grupo sobre o escopo obrigatório versus backlog permanece pendente.

Os detalhes das sete pendências (CONSCIOUS-19, 20, 22, 24, 25, 26 e 27) e da CONSCIOUS-47 foram consultados diretamente no Jira. Todas as sete permanecem **A fazer**: 19, 20 e 22 atribuídas a Eduardo; 24 a 27 atribuídas a Nathan (`natiel228`). A CONSCIOUS-47 está **Feito**, atribuída a Katheriny. Sua flag antiga `Impediment` foi removida em 05/10/2026 após o pedido de Katheriny para resolver o bloqueio. A leitura posterior no Jira confirmou a ausência da sinalização e a preservação de status e responsável. Isso não encerra os alinhamentos pendentes do grupo.

As descrições atualizadas foram relidas após a gravação: preservam os responsáveis/status, retiram a geração concorrente de ID e as instruções de temporizadores para progresso fictício, exigem testes e registram os alinhamentos pendentes. Não foram modificadas as tarefas de Eduardo, nem criadas novas tarefas de evolução.

**Evidências de código na conferência inicial, antes da implementação do scanning:**

- `backend/src/projects/projects.service.ts`: o backend cria o ID e a data do cadastro.
- `src/app/core/services/analysis.service.ts`: já realiza cadastro HTTP, análise HTTP, validação do resultado e cache dos resultados.
- `src/app/feats/projects/project-form/project-form.ts`: atualmente cadastra, analisa e navega diretamente ao dashboard.
- `src/app/app.routes.ts`: não possui a rota de scanning.
- `docs/api-contract.md`: define as cinco categorias, o ID retornado pelo cadastro e os formatos de sucesso/falha; não define eventos de progresso.

##### Arquitetura mínima adotada na implementação, sem duplicar cadastro

A alternativa de reutilizar `AnalysisService` foi executada por Katheriny. O serviço dedicado citado abaixo permanece uma possibilidade futura, não uma pendência desta implementação.

1. Manter o ID e `createdAt` devolvidos pela API, com data ISO; não usar `crypto.randomUUID()` nem `new Date()` como substitutos dos valores do backend no frontend.
2. Reutilizar `AnalysisService` para as chamadas existentes e para guardar metadados dos projetos criados, com consulta protegida por ID. Essa alternativa já foi implementada. Um `ProjectService` separado só será necessário se o grupo preferir uma refatoração futura; nesse caso, delegar responsabilidades sem criar um segundo cadastro.
3. No fluxo implementado, o formulário apenas cadastra e navega para `/projects/:id/scanning`; o scanning é o único responsável por solicitar a análise. Os testes do formulário foram atualizados para esse comportamento.
4. Depois do resultado válido, o scanning navega para o dashboard com o mesmo ID. Um `FAILED` válido também pode seguir para o dashboard, preservando a apresentação de falha já existente. Falha de transporte/timeout fica na tela com mensagem e ação de recuperação, sem sucesso fictício.
5. Para o MVP, usar indicador indeterminado e lista explicativa de etapas. Não representar cada etapa como concluída sem informação do backend.
6. Até existir persistência/consulta de projeto, acesso direto ou recarregamento sem metadados mostra mensagem e link de recuperação. Não reconstruir um projeto inventado a partir do ID.

##### Critérios registrados nas tarefas do Nathan

**[CONSCIOUS-24](https://katherinykc13.atlassian.net/browse/CONSCIOUS-24) — adaptar o cadastro ao projeto retornado pela API**

- Reaproveitar `POST /projects`, usando no Angular o prefixo `/api` já existente.
- Preservar `id` e `createdAt` retornados e os tipos atuais de `Project`/`ProjectDraft`.
- Disponibilizar os metadados do cadastro por ID para o scanning, sem expor estado mutável diretamente.
- Encaminhar o formulário à rota de scanning, sem iniciar uma segunda análise nem criar um cadastro local concorrente.
- Testar cadastro válido, falha de cadastro, leitura dos metadados e navegação com o ID exato recebido.
- Arquivos afetados: `src/app/core/services/analysis.service.ts`, seus testes e `src/app/feats/projects/project-form/`. Se houver serviço dedicado, registrar a divisão aprovada antes de criá-lo.

**[CONSCIOUS-25](https://katherinykc13.atlassian.net/browse/CONSCIOUS-25) — criar tela e rota de scanning com estados testados**

- Criar componente standalone em `src/app/feats/projects/project-scanning/`, incluindo testes; não utilizar `--skip-tests` como critério de entrega.
- Registrar `projects/:id/scanning` em `src/app/app.routes.ts`.
- Ler o ID da rota, consultar os metadados e mostrar o nome real do projeto.
- Tratar ID ausente/inválido e projeto sem metadados com mensagem e link de novo cadastro.
- Testar rota válida, inválida e acesso direto sem estado; validar teclado e texto acessível de espera.

**[CONSCIOUS-26](https://katherinykc13.atlassian.net/browse/CONSCIOUS-26) — mostrar espera real e explicar as etapas**

- Corrigir o objetivo: cinco dimensões mais uma possível etapa preparatória de estrutura, não seis dimensões pontuadas.
- Apresentar estrutura, documentação, testes, acessibilidade, organização e manutenibilidade como explicação do processo.
- Durante a requisição, usar indicador indeterminado e texto acessível; não informar porcentagem ou conclusão individual não recebida.
- Remover o critério de avanço por temporizador, pois o backend já existe.
- Não calcular notas no scanning. Atualizar estado geral somente a partir de resposta, erro ou timeout reais.
- Arquivos afetados: componente, template, estilos e testes dentro de `project-scanning/`.

**[CONSCIOUS-27](https://katherinykc13.atlassian.net/browse/CONSCIOUS-27) — abrir o dashboard após o resultado real**

- Iniciar uma única análise pelo scanning e navegar somente após resultado validado e guardado pelo serviço.
- Preservar o ID do cadastro no pedido e na URL final; rejeitar resposta incompatível com esse ID.
- Manter o tratamento de `FAILED` conforme o contrato, sem trocar o projeto pelo demo.
- Encerrar assinaturas na saída do componente e impedir navegação tardia. Não afirmar que isso cancela o trabalho no servidor.
- Testar sucesso, `FAILED`, erro de transporte, timeout, saída durante espera e ausência de chamadas duplicadas.
- O nome no dashboard depende de disponibilizar metadados ao componente: combinar essa alteração com Letícia em vez de presumir que já está implementada.

##### Proposta de escopo da entrega final

**Necessário para encerrar o MVP:** passos 1 a 7, verificações do passo 14 e clareza das limitações. Corrigir os falsos positivos reproduzidos de acessibilidade/README em PRs pequenas do passo 9, ou obter aceitação explícita das limitações restantes; não apresentar a nota como certificação.

**Qualidade recomendada antes do encerramento:** CI do passo 8 e otimizações essenciais do passo 12. A obrigatoriedade deve ser confirmada pelo grupo.

**Evolução separada, salvo requisito contrário da entrega:** persistência do passo 10, refatoração ampla de contrato, progresso real por etapa e autenticação completa. Melhorias do dashboard podem ser divididas entre correções reproduzidas e evoluções visuais.

**Antes de publicar a API:** cumprir controles de exposição pública do passo 13 e do passo 3; esses controles não podem ser adiados apenas porque autenticação completa ficou fora do MVP.

##### Confirmações restantes para concluir o passo 1

- [x] Katheriny autorizou a atualização das pendências; descrições das CONSCIOUS-24 a 27 publicadas e verificadas, sem mudar responsável ou status.
- [x] Divisão dos serviços e novo fluxo formulário → scanning → dashboard implementados por Katheriny, que assumiu a continuidade das tarefas do Nathan. Foi reutilizado `AnalysisService`, sem cadastro concorrente ou ID local. Verificados por testes de serviço/componentes, teste integrado de rotas e conferência manual com a API real. Este item registra a conclusão técnica, não uma confirmação recebida de Nathan.
- [x] Ajuste de metadados/nome do projeto no dashboard implementado e verificado: `AnalysisService.getProjectById()` fornece os metadados recebidos da API; o dashboard exibe `project?.name ?? projectId`, preservando o fallback do demo. O teste integrado e a conferência no navegador mostraram o nome “Verificação do fluxo”. Este item registra a verificação técnica, não uma aprovação recebida de Letícia.
- [ ] Grupo confirma o escopo obrigatório versus backlog de evolução.
- [x] Katheriny solicitou resolver o bloqueio da CONSCIOUS-47; flag de impedimento removida e resultado verificado no Jira.

Não marcar o passo 1 global como concluído enquanto a decisão de escopo do grupo estiver pendente. As pendências técnicas de serviços/fluxo e metadados já foram resolvidas por Katheriny; não é necessário aguardar Nathan para implementar novamente o que já existe. Aprovação de PR e alinhamento de escopo continuam distintos da implementação e dos testes. Nenhuma confirmação pessoal de Nathan ou Letícia foi presumida.

### Passo 2 — Fortalecer a validação de cadastro no backend

**Responsável sugerida:** Katheriny, em nova tarefa. **Dependência:** passo 1. **Branch sugerida:** `fix/project-input-validation`.

**Arquivos:** `backend/src/projects/dto/create-project.dto.ts`, testes de cadastro em `backend/src/projects/` e `backend/test/`, `backend/src/github/github.service.ts`, `docs/api-contract.md`.

1. Criar testes que reproduzam nome com apenas espaços e URL HTTPS de domínio diferente do GitHub. Ambos passaram pelo DTO na revisão.
2. Normalizar o nome antes da validação e exigir comprimento mínimo após a normalização.
3. Definir e documentar limites máximos de nome, descrição e URL.
4. Validar URL de repositório GitHub no backend: protocolo, host e formato `owner/repo`; combinar a política para `.git`, barra final, credenciais, porta, query e fragmento.
5. Harmonizar com a validação do formulário sem confiar exclusivamente nela.
6. Garantir resposta 400 clara para cadastro inválido, antes de iniciar uma análise.
7. Testar casos válidos e inválidos e atualizar o contrato se houver alteração na entrada aceita.

**Aceite:** cadastro válido continua funcionando; espaços e domínios indevidos são rejeitados; a mensagem corresponde à regra aplicada.

- [ ] Passo 2 implementado, testado e integrado.

### Passo 3 — Proteger e limitar a coleta de arquivos do GitHub

**Responsável sugerida:** Katheriny. **Dependência:** passo 2. **Branch sugerida:** `fix/github-analysis-limits`.

**Arquivos:** `backend/src/github/github.service.ts`, `github.service.spec.ts`, testes de falha da análise e `docs/api-contract.md`.

1. Definir limites de arquivos, bytes, concorrência e duração da operação. Documentar os valores escolhidos; não escolher limites sem testar um repositório representativo.
2. Verificar `tree.truncated`. Se a árvore estiver incompleta, implementar coleta completa dentro dos limites ou falhar com mensagem segura. Não apresentar uma análise parcial como completa.
3. Limitar downloads simultâneos em vez de executar todos com `Promise.all` sem controle.
4. Definir exclusões para dependências, código gerado e artefatos de build; testar que arquivos relevantes não desapareçam por engano.
5. Validar metadados dos blobs e tratar arquivos muito grandes ou indisponíveis.
6. Se o escopo for público, rejeitar explicitamente `repository.data.private === true` antes de baixar conteúdos.
7. Usar token com permissões mínimas, mantê-lo fora do repositório e documentar configuração sem registrar seu valor.
8. Testar árvore truncada, excesso de arquivos/bytes, timeout, repositório privado simulado e erros do GitHub, além do caminho normal.

**Aceite:** operações têm limites previsíveis e a API não apresenta coleta incompleta como sucesso. Não usar repositórios privados reais de terceiros para testar.

**Referência:** o GitHub documenta o sinal de truncamento em [Git Trees](https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28).

- [ ] Passo 3 implementado, testado e integrado.

### Passo 4 — Corrigir navegação e alinhar as promessas da landing

**Responsável principal:** Eduardo; combinar mudanças no header com Nathan. **Jira:** CONSCIOUS-19; textos podem exigir tarefa adicional. **Pode avançar em paralelo aos passos 2 e 3 após o alinhamento.**

**Arquivos:** `src/app/components/header/`, `src/app/components/footer/`, `src/app/feats/home/beneficios/`, `cinco-dimensoes/`, `secao-hero/` e demais seções da home.

1. Mapear todos os links e CTAs para destinos reais.
2. Fazer “Sobre” e “Contato” levarem à seção ou página correspondente, inclusive quando o usuário estiver fora da home.
3. Corrigir os links do footer; remover ou identificar destinos provisórios que não representam o projeto.
4. Substituir promessas de auditoria de vulnerabilidades, cálculo de esforço e ranking por impacto por descrições das regras realmente implementadas.
5. Identificar notas e cartões ilustrativos da landing como exemplos, quando não corresponderem a uma análise real.
6. Conferir que os CTAs principais conduzem ao cadastro ou à demonstração correta.
7. Atualizar os testes de navegação e validar manualmente os destinos.

**Aceite:** não há links sem finalidade nem promessas que o motor não atende. O texto explica análise por regras e suas limitações.

- [ ] Passo 4 implementado, testado e integrado.

### Passo 5 — Concluir acessibilidade e responsividade

**Responsável principal:** Eduardo, com revisão do grupo. **Jira:** CONSCIOUS-20 e 22. **Dependência:** navegação definida no passo 4.

**Arquivos:** header/footer, landing, login, estilos globais e respectivos testes.

1. Transformar o acionador do menu em botão com nome acessível, estado expandido e referência ao painel controlado.
2. Impedir foco em links do menu fechado; implementar abertura/fechamento por teclado, Escape e retorno do foco. Definir a política de foco adequada ao comportamento do painel.
3. Revisar textos alternativos, nomes de links, títulos, hierarquia de headings e IDs duplicados.
4. Testar foco visível, contraste e compreensão sem depender apenas de ícones ou cores.
5. Validar home, formulário, dashboard e login em 375, 768 e 1440 px. A inspeção de CSS não substitui essa execução.
6. Corrigir sobreposição, corte de conteúdo e rolagem horizontal, sem apenas esconder overflow.
7. Conferir ampliação de texto, teclado e movimento reduzido; revisar vídeo automático nesse contexto.
8. Registrar capturas por largura e uma lista dos cenários de teclado executados. Usar ferramentas automáticas como apoio, não como única evidência.

**Aceite:** navegação utilizável sem mouse, painel fechado fora da ordem de foco e conteúdo legível nas larguras acordadas.

- [ ] Passo 5 implementado, validado e integrado.

### Passo 6 — Implementar o scanning ligado à análise real

**Responsável principal:** Nathan; revisão de integração por Katheriny e dashboard por Letícia. **Jira:** CONSCIOUS-24 a 27. **Dependência:** passo 1; seguir o contrato estabilizado pelos passos 2 e 3.

**Arquivos:** `src/app/app.routes.ts`, `src/app/feats/projects/project-form/`, `src/app/core/services/analysis.service.ts`; novos arquivos de scanning dentro de `src/app/feats/projects/`, com localização acordada pelo grupo.

1. Reaproveitar a API para criar o projeto e preservar o ID retornado.
2. Definir onde ficará a consulta aos metadados do projeto, necessária para exibir seu nome. Documentar o que ocorre em acesso direto ou atualização da página antes de existir persistência.
3. Criar `/projects/:id/scanning` e tratar ID/projeto ausente sem travar a aplicação.
4. Escolher um único ponto para iniciar a análise; não disparar a mesma requisição no formulário e no scanning.
5. Exibir espera indeterminada enquanto a API trabalha. Mostrar etapas apenas como descrição, sem marcar conclusão por temporizador.
6. Após receber e validar o resultado, armazená-lo pelo mecanismo existente e navegar ao dashboard com o mesmo ID.
7. Preservar o tratamento de `FAILED`; distinguir falha da análise, falha de transporte e timeout.
8. Tratar destruição do componente, navegação e repetição. Cancelar a assinatura no frontend não garante interromper o processamento no backend.
9. Testar sucesso, falha, acesso inválido, navegação durante espera e ausência de requisições duplicadas.

**Aceite:** formulário → scanning → dashboard usa uma única análise e um único ID. Nenhuma animação simula conclusão técnica não recebida da API.

- [ ] Passo 6 implementado, testado e integrado.

### Passo 7 — Consolidar o fluxo completo e suas evidências

**Responsáveis:** grupo. **Dependência:** passos 2 a 6 integrados.

1. Executar o fluxo pelo navegador com um repositório público pequeno e conhecido.
2. Verificar score, cinco dimensões, findings ordenados e insight coerente com a prioridade recebida.
3. Testar repositório inexistente, cadastro inválido, API indisponível e erros simulados de limite/timeout em ambiente controlado.
4. Executar a demonstração sem consulta ao GitHub; confirmar sua identificação como resultado salvo, com origem e revisão.
5. Testar recarregamento e acesso direto ao dashboard; registrar a limitação de memória, se ainda aceita pelo escopo.
6. Anexar evidências nas tarefas correspondentes e atualizar `docs/proximos-passos-integracao.md` sem apagar seu contexto histórico.
7. Documentar o que a tela de login faz e não faz: atualmente não existe autenticação no backend.

**Aceite:** há evidência do sistema integrado, não somente testes isolados; limitações aceitas estão visíveis na documentação da entrega.

- [ ] Passo 7 concluído.

### Passo 8 — Automatizar verificações em PRs

**Responsável:** a definir pelo grupo. **Dependência:** comandos locais estabilizados. **Branch sugerida:** `ci/project-quality-checks`.

**Arquivos novos:** `.github/workflows/`; configuração de runtime e documentação, se necessário.

1. Definir uma versão de Node compatível com as dependências e registrá-la para desenvolvimento e CI.
2. Instalar dependências com `npm ci` usando os dois lockfiles.
3. Executar testes e build do frontend; testes unitários, E2E, build e lint do backend.
4. Não exigir token real nos testes que simulam GitHub e não expor segredos nos logs.
5. Validar o workflow em uma PR e combinar a exigência dos checks antes de merge. Proteção de branch exige autorização administrativa própria.

**Aceite:** uma PR com teste quebrado é detectada automaticamente e uma PR válida conclui os checks.

- [ ] Passo 8 implementado e validado em PR.

### Passo 9 — Melhorar a precisão das heurísticas

**Responsáveis sugeridos:** Matheus nos seus analyzers; Katheriny em documentação; revisão conjunta do contrato. **Dependência:** testes de regressão e escopo acordado. Fazer PRs pequenas por analyzer.

**Arquivos:** `backend/src/analysis/analyzers/`, `backend/src/scoring/`, tipos/validadores e documentação.

1. Adicionar testes de regressão para input com `aria-label`, label envolvendo input, input oculto e botão apenas com ícone sem nome acessível.
2. Melhorar a leitura do HTML para diferenciar essas situações; avaliar parser adequado em vez de expandir expressões regulares sem controle.
3. Priorizar README da raiz e verificar conteúdo das seções, não só palavras-chave. Testar títulos vazios e descrição válida sem a palavra “sobre”.
4. Documentar que encontrar arquivo de teste não prova execução ou cobertura. Definir extensões/convenções suportadas e testar os limites.
5. Revisar regras de organização/manutenibilidade para reduzir alertas causados por convenções válidas, comentários e conteúdo não executável.
6. Definir como comunicar ausência de arquivos aplicáveis. Uma nota 100 não deve ser apresentada como comprovação de acessibilidade ou qualidade não avaliada.
7. Alinhar a pontuação individual dos analyzers com a pontuação efetivamente usada pelo motor, evitando fórmulas concorrentes sem explicação.
8. Se houver novos campos, categorias ou estados, atualizar contrato, validadores, frontend e fixtures juntos.
9. Se as regras alterarem o demo, regenerar sua evidência com revisão do repositório e versão do motor; não editar notas manualmente.

**Aceite:** os casos reproduzidos são cobertos por testes, as limitações remanescentes estão documentadas e o contrato continua coerente.

- [ ] Passo 9 concluído ou dividido em tarefas explícitas de evolução.

### Passo 10 — Definir persistência e recuperação dos resultados

**Responsáveis sugeridos:** Katheriny e Nathan; revisão de dashboard por Letícia. **Dependência:** decisão de escopo no passo 1. **Não é um requisito automaticamente incluído nas tarefas já concluídas.**

**Situação:** projetos ficam na memória do backend e resultados reais no `Map` do frontend. Recarregar a página perde o resultado; reiniciar o servidor perde os cadastros. O demo salvo é uma exceção.

1. Decidir se essa limitação é aceitável para a entrega atual. Se for, documentar e manter mensagem útil de recuperação.
2. Se persistência for necessária, definir armazenamento, retenção e acesso aos resultados antes de implementar.
3. Criar consulta de projeto/resultado com contrato e tratamento de ausência.
4. Fazer o dashboard recuperar o resultado pela API, mantendo o cache apenas como otimização.
5. Testar atualização da página, nova aba, reinício do backend e resultado inexistente.
6. Evitar criar um projeto novo em cada tentativa de repetir uma análise já cadastrada.
7. Considerar controles de acesso antes de permitir resultados privados ou dados pessoais.

**Aceite:** comportamento após recarregamento/reinício está implementado e testado, ou sua limitação foi formalmente aceita para o MVP.

- [ ] Passo 10 resolvido por implementação ou decisão documentada.

### Passo 11 — Consolidar dashboard, contrato e estados de navegação

**Responsáveis sugeridos:** Letícia e Katheriny; Nathan nas rotas. **Dependência:** decisões dos passos 6, 9 e 10.

**Arquivos:** `src/app/feats/projects/project-dashboard/`, `src/app/core/models/`, `src/app/core/services/`, tipos/validadores do backend e `docs/api-contract.md`.

1. Exibir nome do projeto e data da análise quando os dados estiverem disponíveis, sem inventar metadados.
2. Testar navegação entre dois IDs na mesma rota: o componente atual lê o ID no construtor por `snapshot`. Se o teste reproduzir resultado antigo, reagir às mudanças de parâmetros.
3. Diferenciar carregamento, ausência, falha e demonstração salva; manter a prioridade fornecida pelo backend.
4. Revisar a validação da resposta de cadastro, que hoje verifica essencialmente a presença do ID.
5. Adicionar tratamento de rota inexistente com destino útil.
6. Avaliar uma fonte compartilhada de contrato/schema para reduzir duplicação. Evitar refatoração ampla sem benefício e testes demonstráveis.

**Aceite:** trocar o projeto não mantém resultado antigo; estados e metadados correspondem à fonte real; frontend/backend concordam sobre o contrato.

- [ ] Passo 11 concluído.

### Passo 12 — Otimizar assets e a experiência offline

**Responsável sugerido:** Eduardo, com apoio do grupo. **Dependência:** layout estabilizado.

**Arquivos:** `public/assets/`, `public/videos/`, referências da landing/login, estilos e `src/index.html`.

1. Inventariar os arquivos realmente utilizados antes de remover qualquer asset.
2. Redimensionar e comprimir imagens, especialmente logos pequenos servidos por arquivos grandes.
3. Otimizar o vídeo principal, definir poster e carregamento adequado; oferecer alternativa em movimento reduzido e telas pequenas.
4. Conferir fontes e ícones dependentes de CDN. Se a apresentação precisa funcionar offline visualmente, servir localmente os recursos necessários respeitando suas licenças.
5. Medir carregamento com rede limitada e conferir a aparência offline do demo.
6. Não tratar apenas o tamanho do bundle JavaScript como tamanho total da página: a pasta pública tinha aproximadamente 17 MB na revisão.

**Aceite:** redução medida de transferência, sem regressão visual; o alcance da disponibilidade offline está explícito.

- [ ] Passo 12 concluído.

### Passo 13 — Preparar operação pública e decidir o futuro do login

**Responsáveis:** grupo; backend por Katheriny; infraestrutura a definir. **Dependência:** antes de exposição pública da API. Autenticação completa pode permanecer fora do MVP se acordado.

1. Documentar configuração de API/reverse proxy para produção, variáveis de ambiente e inicialização. O proxy de desenvolvimento não é uma implantação de produção.
2. Adicionar verificação de saúde, logs de falha úteis sem segredos e configuração adequada da observabilidade existente.
3. Definir proteção contra abuso: limites de chamadas e de processamento, especialmente nos endpoints que consultam GitHub.
4. Revisar dependências e executar verificações de segurança; a aprovação dos testes não equivale a uma auditoria de segurança.
5. Decidir se login continuará demonstrativo ou será implementado em tarefa própria com autenticação, autorização e tratamento de dados. Não anunciar login funcional antes disso.
6. Documentar permissões, retenção e exposição de resultados se persistência/autenticação entrarem no escopo.

**Aceite:** implantação possui instruções verificáveis e controles compatíveis com sua exposição; recursos demonstrativos estão identificados.

- [ ] Passo 13 concluído para o ambiente escolhido ou separado em backlog antes de uma futura publicação.

### Passo 14 — Encerrar a entrega e organizar o backlog

**Responsáveis:** grupo. **Dependência:** todos os passos obrigatórios para o escopo acordado.

1. Executar novamente todas as verificações abaixo sobre o código integrado.
2. Repetir os cenários de navegador do passo 7 e a matriz de larguras/teclado do passo 5.
3. Atualizar README, contrato, guia de integração e este checklist com os resultados reais.
4. Anexar evidências e PRs às tarefas correspondentes; não marcar uma tarefa concluída apenas porque os testes passaram.
5. Listar limitações aceitas e melhorias adiadas com responsável e tarefa própria. Não confundir “fora do escopo” com “implementado”.
6. Obter revisão das PRs e integrar conforme o fluxo do grupo. Não realizar merge automático de branches antigas sem conciliação.
7. Só excluir branches após confirmar integração e ausência de commits/alterações exclusivos necessários.

**Aceite:** cada requisito tem implementação/evidência ou decisão explícita de exclusão do escopo, sem pendências ocultas.

- [ ] Passo 14 concluído; entrega e backlog revisados pelo grupo.

## 4. Comandos de verificação

Na raiz do projeto, após mudanças de frontend:

```sh
cd /Users/katherinykamilicorrearocha/Documents/project-conscious
npm test -- --watch=false
npm run build
git diff --check
```

No backend, após mudanças dessa frente:

```sh
cd /Users/katherinykamilicorrearocha/Documents/project-conscious/backend
npm test
npm run test:e2e
npm run build
npm run lint
git diff --check
```

Usar testes específicos durante o desenvolvimento, mas executar a suíte da frente afetada antes da PR e ambas as frentes após integração. Para instalação reproduzível, usar `npm ci` na raiz e no backend com o runtime acordado.

Antes de publicar uma entrega:

```sh
git status --short
git diff --stat
git diff --check
```

Revisar os arquivos e adicionar somente o escopo da entrega. Commit, push, abertura de PR e merge são ações separadas: validar e revisar antes de cada uma.

## 5. Critério global de conclusão

### Registro de implementação — fluxo de cadastro, scanning e dashboard

Em 05/10/2026, Katheriny autorizou assumir a implementação do fluxo anteriormente atribuído a Nathan, em nova branch e sem commit/push automático. Branch criada: `feat/project-scanning-flow`, no checkout original. Esta autorização não foi convertida em mudança de responsáveis ou status no Jira.

- Implementados os quatro pontos do fluxo discutido: serviço reutilizado com cache protegido de metadados, formulário somente cadastra, scanning solicita análise real, dashboard apresenta o resultado e nome do projeto.
- Criada a rota e o componente `src/app/feats/projects/project-scanning/`, com espera indeterminada, lista explicativa, recuperação e cancelamento de assinatura na saída.
- Preservados contrato, demo e ID/data da API. Não foram implementados persistência, progresso real por etapa ou autenticação.
- A nova tentativa utiliza o mesmo ID; resultado já guardado pode ser reaberto sem nova chamada. Navegação recusada tem recuperação.
- Validação realizada: **67 testes Angular passando em 19 arquivos**, build de produção passando e `git diff --check` sem erros. Inclui teste de integração com roteamento entre as três telas e HTTP simulado; não equivale a validação visual ou teste com GitHub ao vivo.
- Backend não foi alterado nesta entrega; a suíte dele não foi repetida por não haver mudança nessa frente.
- Conferência manual no navegador em 05/10/2026 com Angular na porta 4205 e API local na porta 3000: cadastro de “Verificação do fluxo” usando o repositório público `katherinykamili/project-conscious-demo`, passagem pelo scanning e chegada ao dashboard com o mesmo ID `7ec3ebf4-0d40-43af-93af-7be69c4a752f`. Resultado real: 74/100, cinco dimensões, findings e insight; sem identificação de demo nem erros de console observados no fluxo de sucesso.
- Acesso direto ao scanning em outra aba sem metadados mostrou recuperação para novo cadastro; o link funcionou. Outro cadastro com repositório inexistente chegou ao dashboard de falha com mensagem segura, sem substituir o resultado pelo demo.
- Na largura estreita disponível durante a conferência, o header mostrou sobreposição de elementos; permanece pendência visual da frente de navegação/responsividade. Não foi executada a matriz completa de 375/768/1440 px nem certificada a acessibilidade nesta conferência.
- O log do backend registrou rejeição 401 da telemetria do Observe por configuração de credenciais, sem impedir a análise. Essa configuração permanece como melhoria operacional do passo 13. A API temporária iniciada para a conferência foi encerrada ao final; o servidor Angular preexistente foi preservado.
- O arquivo deste plano já estava sem commit antes da criação da branch e foi preservado. Revisar separadamente ao selecionar os arquivos do commit.

**Pendências antes de considerar a entrega final:** revisão humana do diff, matriz de teclado/larguras e correção do header, eventual ajuste do Jira e PR/merge somente após aprovação. A conferência básica no navegador com API foi realizada, mas os demais passos deste plano permanecem com seus próprios critérios; esta implementação não conclui todo o plano.

- [ ] Cadastro e análise usam uma única fonte de ID e respeitam o contrato.
- [ ] Scanning representa espera real e não promete progresso inexistente.
- [ ] Links e textos representam o produto implementado.
- [ ] Navegação por teclado e larguras acordadas foram verificadas.
- [ ] Coleta do GitHub tem limites e tratamento de incompletude.
- [ ] Limitações das heurísticas, persistência, login e offline estão claras.
- [ ] Testes, builds e lint aplicável passam no código integrado.
- [ ] Evidências do navegador e do demo estão anexadas às entregas.
- [ ] Cada melhoria adiada tem uma decisão explícita de backlog.

**Próxima ação:** executar o passo 1 com o grupo. Depois, Katheriny pode iniciar o passo 2 enquanto Eduardo trabalha no passo 4; Nathan implementa o passo 6 após alinhar a responsabilidade do cadastro e do scanning. Essa divisão evita sobreposição e preserva a integração já entregue.
