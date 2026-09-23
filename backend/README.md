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
| `GET` | `/` | Verifica se o backend NestJS está em execução. |

As rotas de projetos e análise serão documentadas aqui quando o contrato da API estiver publicado.

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
