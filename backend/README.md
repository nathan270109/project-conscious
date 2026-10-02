# Project Conscious

O **Project Conscious** é uma plataforma que analisa repositórios públicos do GitHub e traduz sinais técnicos em uma visão clara da saúde do software. O resultado apresenta o **Conscious Score**, as dimensões avaliadas, riscos encontrados e uma recomendação prioritária de melhoria.

O projeto foi desenvolvido como parte do Entra21 e prioriza resultados objetivos, rastreáveis e fáceis de explicar.

## Visão geral

O fluxo principal da aplicação será:

1. A pessoa informa o nome do projeto e a URL de um repositório público do GitHub.
2. A API identifica a branch padrão e busca somente os arquivos necessários.
3. O motor de análise gera evidências nas cinco dimensões avaliadas.
4. O dashboard apresenta a nota geral, os riscos e a melhoria mais importante.

## Dimensões avaliadas

- **Documentação:** existência e qualidade básica do README.
- **Testes:** presença de arquivos de teste.
- **Acessibilidade:** imagens sem `alt`, campos sem `label` e botões sem texto.
- **Organização:** estrutura de pastas e nomes de arquivos.
- **Manutenibilidade:** `TODO`, `console.log` e arquivos extensos.

### Regras iniciais de organização e manutenibilidade

Estas regras são sinais determinísticos para orientar a revisão, não provas de
que o código contém um bug:

- A profundidade conta somente os diretórios antes do arquivo. Mais de 6
  diretórios gera um finding `MEDIUM`, pois caminhos muito profundos dificultam
  localizar e mover arquivos.
- Pastas usam nomes em kebab-case minúsculo. Arquivos usam letras minúsculas,
  números, hífens e pontos para extensões; `README`, `LICENSE` e `CHANGELOG`
  são nomes convencionais aceitos. Uma violação gera um finding `LOW`.
- `TODO` gera um finding `LOW` com a linha encontrada, para que pendências não
  sejam esquecidas.
- `console.log` gera um finding `LOW` com a linha encontrada. Ele é apenas um
  sinal de manutenção: logs podem ser intencionais e devem ser avaliados no
  contexto antes de serem removidos.
- Arquivos com mais de 300 linhas geram um finding `MEDIUM`. O limite favorece
  módulos menores e mais fáceis de testar; arquivos exatamente com 300 linhas
  ainda estão dentro do limite.

> Cada resultado deve apontar uma evidência real, como mensagem, arquivo e linha quando disponível. O Project Conscious não inventa análises.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Frontend | Angular 22 + TypeScript |
| Backend | NestJS 12 + TypeScript |
| Integração GitHub | Octokit REST |
| Testes | Vitest |

## Estrutura do repositório

```text
project-conscious/
├── src/                 # Aplicação Angular
├── backend/             # API NestJS
├── public/              # Recursos estáticos do frontend
├── package.json         # Scripts e dependências do frontend
└── README.md
```

Frontend e backend são aplicações separadas, executadas em terminais diferentes, mas pertencem ao mesmo repositório Git.

## Pré-requisitos

- Node.js em versão LTS compatível com Angular e NestJS.
- npm.
- Git.
- Uma conta GitHub apenas se quiser criar um token opcional para aumentar o limite de requisições da API.

## Como executar localmente

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd project-conscious
```

### 2. Inicie o frontend

No primeiro terminal, na raiz do projeto:

```bash
npm ci
npm start
```

Acesse [http://localhost:4200](http://localhost:4200).

### 3. Inicie o backend

No segundo terminal:

```bash
cd backend
npm ci
npm run start:dev
```

Acesse [http://localhost:3000](http://localhost:3000). Nesta fase inicial, a rota `GET /` responde `Hello World!`, confirmando que a API está ativa.

## Variáveis de ambiente

O backend lê o token do GitHub exclusivamente pela variável `GITHUB_TOKEN`. Para repositórios públicos, ele é opcional; use-o apenas se precisar de um limite maior de requisições.

No terminal do backend, antes de iniciar a API:

```bash
export GITHUB_TOKEN="seu_token"
npm run start:dev
```

Nunca escreva tokens no código, no README, no Jira ou em commits.

## Scripts úteis

### Frontend

| Comando | Finalidade |
| --- | --- |
| `npm start` | Executa o Angular em modo de desenvolvimento. |
| `npm test` | Executa os testes do frontend em modo de observação. |
| `npm run build` | Gera a versão de produção do frontend. |

### Backend

Execute os comandos dentro de `backend/`.

| Comando | Finalidade |
| --- | --- |
| `npm run start:dev` | Executa o NestJS e observa alterações. |
| `npm run build` | Compila a API para `backend/dist`. |
| `npm test` | Executa os testes unitários. |
| `npm run lint` | Verifica problemas de código. |

## Estado atual

- [x] Estrutura inicial do frontend Angular.
- [x] Backend NestJS iniciado em `backend/`.
- [x] Serviço para leitura seletiva de repositórios públicos com Octokit.
- [ ] Formulário completo e rota de scanning.
- [ ] Endpoint para iniciar a análise de um projeto.
- [ ] Motor de análise, Score e Risk Radar.
- [ ] Dashboard com resultado da análise.
- [ ] Modo demonstração sem internet.

## API atual

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/projects` | Cria um projeto em memória após validar nome, URL e descrição opcional. |

### Respostas esperadas

#### Análise — `POST /projects/:id/analyze` (ainda não ativa)

O controller existe e tem testes HTTP isolados, mas não está registrado no
`ProjectsModule`. Falta conectar o motor real antes de disponibilizar a rota.
Depois da ativação, usar o UUID v4 retornado por `POST /projects`, sem corpo na
requisição de análise. Os projetos ficam em memória e não sobrevivem a reinícios.

Respostas previstas pelo controller: 200 com `COMPLETED`; 400 para UUID inválido;
404 padrão para projeto inexistente; 404 com `FAILED/REPOSITORY_NOT_FOUND` para
repositório inexistente; 500 com `FAILED/ANALYSIS_FAILED` para demais falhas.
O consumidor deve inspecionar o corpo do erro, pois nem todo erro é AnalysisResult.
Exemplos completos e comandos estão em [contrato da API](../docs/api-contract.md).
O 503 da leitura direta de arquivos descrito abaixo não é o status exposto pela
orquestração de análise, que converte essas falhas para 500 seguro.

#### Cadastro de projeto — `POST /projects`

| Situação | Status | Resposta esperada |
| --- | --- | --- |
| Projeto válido | `201 Created` | Retorna `id`, `name`, `repositoryUrl`, `description` quando informada e `createdAt`. |
| Corpo inválido | `400 Bad Request` | Retorna mensagens de validação, por exemplo para nome com menos de 3 caracteres ou URL inválida. |

Exemplo de requisição válida:

```json
{
  "name": "Project Conscious Demo",
  "repositoryUrl": "https://github.com/octocat/Hello-World",
  "description": "Repositório usado para demonstração"
}
```

#### Leitura de repositório público — `GithubService`

A rota de análise que chamará este serviço ainda será criada. Quando ela existir, deve preservar as respostas abaixo para que o frontend trate erros de forma previsível:

| Situação | Status | Mensagem segura para o frontend |
| --- | --- | --- |
| URL fora do padrão `https://github.com/owner/repo` | `400 Bad Request` | `Informe uma URL válida, como https://github.com/owner/repo` |
| Repositório público inexistente | `404 Not Found` | `Repositório público não encontrado.` |
| Limite de requisições, acesso negado ou GitHub indisponível | `503 Service Unavailable` | `GitHub indisponível ou limite de requisições atingido. Tente novamente mais tarde.` |
| Falha de rede ou erro técnico sem status | `503 Service Unavailable` | `Não foi possível consultar o GitHub. Verifique sua conexão e tente novamente.` |

A API não retorna token, stack trace nem detalhes internos. Os logs do backend registram somente o status técnico necessário para diagnóstico.

## Regra de análise de documentação

O `DocumentationAnalyzer` avalia somente arquivos README, sem usar IA.

A regra é determinística:

| Situação | Nota | Resultado |
| --- | ---: | --- |
| README ausente | `0` | finding `HIGH` |
| Descrição ausente | -30 pontos | finding `MEDIUM` |
| Instalação ausente | -30 pontos | finding `MEDIUM` |
| Execução ausente | -30 pontos | finding `MEDIUM` |
| README completo | `100` | nenhum finding |

O analisador reconhece arquivos como `README`, `README.md` e `docs/README.md`.

Cada finding informa categoria, severidade, mensagem, arquivo e linha quando disponível. Os resultados são reproduzíveis: os mesmos arquivos sempre geram a mesma nota e os mesmos findings.

## Conscious Insight — CONSCIOUS-45

O serviço `src/insights/insights.service.ts` reutiliza o tipo compartilhado
`Insight` de `src/analysis/types/analysis.types.ts` e retorna somente `category`,
`title` e `message`, conforme `../docs/api-contract.md`.

### Convenções adotadas nesta integração

- `generate(dimensions, orderedFindings)` recebe as cinco notas do ScoringService
  e os findings já ordenados pela CONSCIOUS-44. A menor nota dá contexto à mensagem;
  o primeiro finding define a ação, o título e a categoria do insight.
- Empates mencionam todas as dimensões empatadas na ordem: documentação, testes,
  acessibilidade, organização e manutenibilidade, independentemente da entrada.
- Entradas malformadas são rejeitadas antes da geração, inclusive sem findings.
- Não ordena riscos, não recalcula scores, não modifica a entrada e não faz
  chamadas externas. A mesma entrada produz a mesma saída.
- A mensagem preserva o apontamento e inclui o arquivo e, quando disponível,
  a linha. Os dados vêm dos findings recebidos; o serviço não cria evidências.
- Sem findings, retorna `DOCUMENTATION`, título `Nenhum risco identificado` e
  mensagem `As regras executadas não identificaram findings nesta análise.`.
  Essa categoria é uma convenção de apresentação, não uma deficiência detectada
  nem indicação da pior dimensão. Ausência de findings não garante ausência de
  problemas no projeto.

As convenções acima foram aprovadas por Katheriny para esta implementação:
menor nota como contexto e primeiro finding já ordenado como ação. Se as categorias
forem diferentes, ambas aparecem explicitamente na mensagem. Sem findings, não
se escolhe pior dimensão e a categoria convencional continua `DOCUMENTATION`.
Essas escolhas preservam o formato do contrato, sem recalcular notas ou riscos.

Isso não representa aprovação dos demais integrantes nem atualização do Jira.
Ainda é necessário comunicar a assinatura e a interpretação à equipe. A regra
agora considera pior dimensão e finding prioritário da CONSCIOUS-45. No dashboard, a categoria do caso
sem findings não deve ser apresentada como deficiência detectada. Mudanças
futuras nessas regras devem atualizar serviço, testes e documentação juntos.

Exemplo ilustrativo (não é evidência de execução em um repositório real):

```json
{
  "category": "DOCUMENTATION",
  "title": "Comece pela documentação",
  "message": "Documentação apresentou a menor nota: 60/100. Como primeira ação, revise o apontamento de documentação: README não possui instruções de instalação. Revise esse apontamento no arquivo README.md:12."
}
```

### Integração e validação

`src/insights/insights.module.ts` exporta `InsightsService`. O módulo consumidor
deverá importar `InsightsModule`; essa conexão fica para a CONSCIOUS-49.
Esta entrega não registra outro endpoint nem altera a orquestração existente.
O serviço gera apenas o insight de uma análise concluída; na resposta `FAILED`,
a orquestração mantém `insight: null`, conforme o contrato.

Integração local em 2026-09-28: os cinco analisadores estão registrados e
exportados pelo `AnalysisModule`. Testes e acessibilidade foram incorporados
seletivamente da entrega `b6fccb7a056b4379163945b2bd7c9957e0695272` da branch
`origin/feat/tests-accessibility-analyzers`, preservando organização,
manutenibilidade e os tipos existentes. A integração corrige o escape de IDs
HTML na expressão regular de associação de labels e adiciona testes de regressão.

Ainda falta a ordenação de riscos da CONSCIOUS-44, não localizada nas referências
remotas atualizadas nesta revisão. A branch `feat/risk-radar` contém a interface,
não o serviço de ordenação do backend. Não ativar o motor nem gerar um demo
completo antes de integrar essa dependência real.
O scoring retorna cinco dimensões mesmo com findings parciais; portanto, sua
saída sozinha não comprova que todas as categorias foram analisadas.

Os testes estão em `src/insights/insights.service.spec.ts`. Dentro de `backend/`:

```bash
npm test -- insights.service.spec.ts
npm test
npm run test:e2e
npm run build
git diff --check
```

A evidência de demonstração real ainda depende da integração: registrar o
repositório, a revisão analisada e a saída obtida, alinhando com CONSCIOUS-39 e
CONSCIOUS-47. Não apresentar o exemplo ilustrativo acima como análise real.

### Regras de testes e acessibilidade integradas

O `TestsAnalyzer` procura `.spec.ts`, `.test.ts`, `.spec.js` e `.test.js`.
Sem esses arquivos, retorna nota individual `0` e finding `HIGH`; ele não executa
testes nem mede cobertura. Não detecta testes de todas as linguagens/frameworks.

O `AccessibilityAnalyzer` aplica heurísticas em arquivos `.html` e `.htm`:
imagens sem `alt`, inputs sem associação explícita `id`/`label for` e botões
vazios sem `aria-label`. Registra arquivo e linha; não é uma auditoria completa
de acessibilidade. Labels envolvendo inputs e outras formas de nome acessível
não são reconhecidos por essa primeira versão, podendo gerar falsos positivos.

As notas individuais dos analisadores não substituem o score agregado:
a integração deve usar `ScoringService.calculate(findings)` conforme o plano.

## Contribuição

1. Atualize sua cópia da `main` antes de iniciar uma entrega.
2. Crie uma branch com nome objetivo, por exemplo `feat/github-integration`.
3. Faça commits pequenos e descritivos.
4. Envie a branch com `git push origin nome-da-branch`.
5. Abra uma Pull Request para revisão antes do merge.

Exemplos de commits:

```text
feat(github): lê arquivos relevantes de repositórios públicos
feat(dashboard): exibe conscious score e dimensões
fix(project-form): valida URL do GitHub
docs(readme): documenta execução local
```

Não faça commits diretamente na `main` e não altere arquivos de outra frente sem alinhamento com a equipe.

## Solução de problemas

### A porta 3000 já está em uso

Descubra o processo que ocupa a porta:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Depois encerre somente o PID retornado:

```bash
kill <PID>
```

### O backend mostra erro de telemetria 401

O aviso do `NestJS Observe` é uma configuração opcional do template e não impede a execução da API ou do serviço GitHub. Ele pode ser removido ou configurado posteriormente.

## Organização no Jira

O quadro utiliza a chave `CONSCIOUS`. Ao concluir uma entrega:

1. Atualize o status da subtarefa correspondente.
2. Registre uma observação curta sobre o que foi feito e testado.
3. Inclua o link da Pull Request quando ela existir.

### Pontuação e Conscious Score

Cada dimensão começa com nota `100`.

Os findings reduzem a nota conforme a severidade:

| Severidade | Desconto |
| --- | ---: |
| `CRITICAL` | 40 |
| `HIGH` | 25 |
| `MEDIUM` | 10 |
| `LOW` | 5 |

A nota de uma dimensão nunca fica abaixo de `0`.

O Conscious Score é a média arredondada das cinco dimensões:

- Documentação;
- Testes;
- Acessibilidade;
- Organização;
- Manutenibilidade.

### Priorização de riscos

O `RisksService` ordena findings para o Risk Radar:

1. `CRITICAL`
2. `HIGH`
3. `MEDIUM`
4. `LOW`

Em caso de empate, a ordenação usa categoria, arquivo e linha. O serviço cria uma cópia antes de ordenar e não altera a lista original de findings.
