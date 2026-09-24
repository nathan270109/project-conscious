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
