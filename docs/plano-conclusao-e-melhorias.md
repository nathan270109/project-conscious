# Plano de conclusão e melhorias — Project Conscious

Atualizado em **12/10/2026** com base no estado do repositório e da branch de redesign. Em 13/10/2026 a infraestrutura AWS publicada (S3, CloudFront, API Gateway, Lambda e bucket de state) foi **destruída** e o Terraform removido: o chat de IA passou a rodar **no backend NestJS local**, acessando o Bedrock Mantle com credenciais do operador (ver `infra/README.md`).

Este documento substitui o plano elaborado em 05/10/2026. O registro detalhado daquela revisão foi preservado em [plano-conclusao-e-melhorias-2026-10-05.md](plano-conclusao-e-melhorias-2026-10-05.md).

## 1. Estado atual

O MVP está funcional: cadastra um repositório público, executa a análise real em cinco dimensões, apresenta o resultado no dashboard e permite consultar a **Conscious AI** sobre a análise. O chat roda no backend local e chama o Bedrock; **não há infraestrutura AWS provisionada**.

Referências do estado revisado:

- `origin/master`: commit `5a2cd06`, incluindo as PRs #66 e #67;
- branch atual: `feat/unified-design-system`, commit `655ee47`;
- PR de redesign: [#71 — feat: unifica design system do produto](https://github.com/nathan270109/project-conscious/pull/71), aberta como rascunho;
- o redesign está implementado e testado, mas ainda não está integrado à `master`.

### Resumo por frente

| Frente | Estado | Observação |
| --- | --- | --- |
| Cadastro, contrato e validação | Concluído | A API gera o ID; entradas são normalizadas e validadas no frontend e backend. |
| Coleta do repositório | Concluído | Clone raso temporário, limites, isolamento e limpeza substituíram a API REST do GitHub. |
| Fluxo formulário → scanning → dashboard | Concluído | Uma única análise e um único ID, sem progresso fictício. |
| Dashboard e explicação dos problemas | Concluído | Score, dimensões, findings, recomendações e estados de falha estão integrados. |
| Conscious AI | Concluído | Chat contextual, três perguntas prontas e explicação por finding. |
| IA AWS | Reformulado em 13/10/2026 | Sem Terraform/CloudFront/Lambda: `POST /ai/chat` no backend NestJS chama o Bedrock Mantle com SigV4 local. |
| Navegação, rotas e responsividade | Concluído | Links reais, menu responsivo, rota 404 e tratamento de acesso direto. |
| Design system unificado | Implementado; integração pendente | Todas as telas foram atualizadas na PR #71. |
| CI multiplataforma | Concluído | GitHub Actions valida macOS, Linux e Windows, frontend, backend e inicializadores. |
| Persistência e autenticação | Fora do MVP atual | Permanecem como evolução obrigatória somente para uso de produção. |

## 2. Entregas concluídas

### Produto e integração

- [x] Preservar o ID criado pela API em todo o fluxo.
- [x] Separar cadastro e análise: o formulário cadastra e o scanning executa a análise.
- [x] Implementar `/projects/:id/scanning` com espera indeterminada, timeout, falhas e recuperação.
- [x] Exibir resultado real no dashboard sem substituir falhas pelo projeto de demonstração.
- [x] Manter o projeto de demonstração disponível sem depender do GitHub.
- [x] Diferenciar análise concluída, falha de negócio, falha de transporte e resultado ausente.
- [x] Limpar o cabeçalho do dashboard e manter apenas o link do repositório em uma apresentação adequada.
- [x] Implementar rota de página não encontrada e destinos reais no header, footer e CTAs.

### Backend e análise

- [x] Normalizar e limitar nome, descrição e URL do projeto.
- [x] Aceitar somente URLs HTTPS válidas de repositórios públicos do GitHub.
- [x] Implementar clone temporário sem token, com diretório exclusivo e limpeza em sucesso ou falha.
- [x] Limitar arquivos, bytes, objetos Git, concorrência e duração da coleta.
- [x] Excluir dependências, builds e artefatos gerados da análise.
- [x] Manter cinco dimensões: documentação, testes, acessibilidade, organização e manutenibilidade.
- [x] Validar o contrato do resultado e ordenar findings por prioridade.

### IA e infraestrutura

- [x] Integrar o modelo `google.gemma-4-e2b` no Amazon Bedrock Mantle (endpoint compatível com OpenAI).
- [x] Validar e truncar pergunta, histórico e findings antes da inferência (portado para `backend/src/ai/`).
- [x] Criar o chat **Conscious AI** com histórico rolável e contexto da análise atual.
- [x] Disponibilizar as três perguntas pré-processadas definidas para o produto.
- [x] Disponibilizar explicação assistida por IA em cada problema encontrado.
- [x] Encerrar a infra AWS publicada (13/10/2026): `terraform destroy` das pilhas do site e do chat, remoção do código Terraform e do bucket de state.
- [x] Mover o atendimento do chat para o backend local com SigV4 manual, sem SDK, em `backend/src/ai/bedrock-mantle.service.ts`.
- [x] Documentar a decisão e o acesso ao Bedrock em `infra/README.md`.

### UX, UI e qualidade

- [x] Corrigir menu móvel, foco, Escape, nomes acessíveis e estados expandidos.
- [x] Validar layout nas larguras de referência e remover sobreposições e rolagem horizontal indevida.
- [x] Padronizar tokens, tipografia, cores, superfícies, botões, formulários e estados.
- [x] Aplicar o mesmo design system à home, cadastro, scanning, dashboard, chat, login e 404.
- [x] Documentar o sistema visual em `docs/design-system.md`.
- [x] Remover assets e estilos sem uso identificados durante o redesign.
- [x] Automatizar testes, builds, lint e smoke test dos inicializadores no GitHub Actions.

## 3. Verificação atual

Executada em 12/10/2026 sobre `feat/unified-design-system`:

| Verificação | Resultado |
| --- | --- |
| Frontend | 95 testes em 21 arquivos |
| Build Angular | Concluído sem erro; bundle inicial de 451,40 kB |
| Backend unitário | 182 testes em 20 arquivos |
| Backend E2E | 34 testes em 5 arquivos |
| Build do backend | Concluído sem erro |
| Lint do backend | Concluído sem erro |
| Inicializadores | 5 testes concluídos |

O workflow `.github/workflows/compatibilidade.yml` repete essas verificações em pull requests e, adicionalmente, executa os ensaios de compatibilidade e clone público em Ubuntu, macOS e Windows.

## 4. Pendências para encerrar a versão atual

Estas são as únicas pendências que bloqueiam o fechamento da versão de demonstração:

1. **Revisar e integrar o redesign**
   - [ ] Retirar a PR #71 do modo rascunho quando a revisão estiver pronta.
   - [ ] Confirmar os checks da PR e tratar apenas regressões reais.
   - [ ] Aprovar e fazer merge da PR #71 em `master`.

2. **Integrar o redesign localmente**
   - [ ] Atualizar o checkout com a `master` após o merge.
   - [ ] Gerar novamente o build Angular e do backend.
   - [ ] Validar o proxy `/api/ai/**` para o backend local com credenciais AWS exportadas.

3. **Realizar o smoke test local final**
   - [ ] Verificar home, cadastro, scanning, dashboard, login demonstrativo e 404.
   - [ ] Executar uma análise real de repositório público e abrir o demo salvo.
   - [ ] Testar o chat, as três perguntas prontas e a explicação de um finding.
   - [ ] Conferir atualização de rota e acesso direto sem retornar `Not Found` do servidor.
   - [ ] Conferir desktop e viewport móvel em `127.0.0.1`.

4. **Registrar o fechamento**
    - [ ] Atualizar o README somente se comandos ou limitações mudarem.
    - [ ] Registrar o resultado do smoke test e a revisão integrada.
   - [ ] Manter as limitações de demonstração descritas de forma explícita.

## 5. Backlog pós-MVP

Os itens abaixo não bloqueiam a demonstração atual. Devem voltar ao plano somente se o produto passar a armazenar análises de usuários ou operar como serviço de produção.

### Obrigatório antes de produção

- [ ] Adicionar autenticação e autorização à API de IA e aos futuros resultados persistidos.
- [ ] Implementar persistência de projetos e análises com retenção e controle de acesso definidos.
- [ ] Permitir recuperação do resultado após recarga, nova aba ou reinício do backend.
- [ ] Adicionar alarmes, métricas de custo, rastreabilidade e política de resposta operacional.
- [ ] Avaliar domínio próprio, certificado ACM e política TLS controlada.
- [ ] Executar revisão específica de segurança e abuso; throttling não substitui autenticação.

### Evoluções de produto

- [ ] Implementar progresso real por eventos do backend caso porcentagem por etapa seja necessária.
- [ ] Evoluir heurísticas com parser estruturado e casos adicionais de regressão.
- [ ] Explicar no resultado quando uma dimensão não pôde ser avaliada por ausência de arquivos aplicáveis.
- [ ] Avaliar compartilhamento, histórico e comparação entre análises após existir persistência.
- [ ] Medir qualidade das respostas da IA e criar casos de avaliação antes de ampliar seu escopo.

## 6. Itens removidos ou reformulados

Os pontos abaixo foram retirados do plano ativo porque foram substituídos, perderam sentido ou não fazem parte do escopo atual:

- criação de um `ProjectService` apenas para duplicar o estado do `AnalysisService`;
- geração local de ID ou cadastro concorrente no frontend;
- barra de progresso baseada em temporizador e marcação fictícia de etapas;
- tratamento de “estrutura” como sexta dimensão pontuada;
- coleta pela API REST do GitHub, paginação, token e cache persistente do código;
- otimização do vídeo antigo da hero, removido pelo novo design;
- exigência de experiência totalmente offline para a aplicação publicada;
- exibição no dashboard de ID interno, revisão e data técnica como metadados principais;
- persistência e autenticação como bloqueadores da demonstração acadêmica;
- antigas divisões por integrante, snapshots do Jira e sugestões de branches já superadas;
- repetição de listas de arquivos e instruções de implementação de tarefas já concluídas.

## 7. Critério de conclusão

A versão atual poderá ser considerada encerrada quando:

- [ ] a PR #71 estiver revisada e integrada à `master`;
- [ ] o build integrado passar na validação local (frontend + backend + launcher);
- [ ] o smoke test local final passar nos fluxos principais e na Conscious AI;
- [ ] as limitações de memória, login demonstrativo e credenciais locais do chat estiverem mantidas na documentação.

Persistência, autenticação completa, progresso real e evolução das heurísticas pertencem ao pós-MVP e não impedem esse encerramento.
