# ProjectConscious

O **Project Conscious** analisa repositórios públicos do GitHub e transforma sinais técnicos em uma visão clara da saúde do projeto. A aplicação apresentará um **Conscious Score**, as dimensões avaliadas, riscos encontrados e uma recomendação prioritária de melhoria.

## O que o projeto avalia

- Documentação
- Testes
- Acessibilidade
- Organização
- Manutenibilidade

> O resultado deve ser explicável: cada risco informa o motivo, o arquivo e, quando disponível, a linha relacionada.

## Estrutura do repositório

```text
project-conscious/
├── src/                 # Frontend Angular
├── backend/             # API NestJS
├── package.json         # Dependências e scripts do frontend
└── README.md
```

O frontend e o backend são aplicações separadas, mas fazem parte deste mesmo repositório Git.

## Tecnologias

- Angular 22 — interface web
- NestJS 12 — API REST
- TypeScript — linguagem principal
- Vitest — testes

## Executar o projeto localmente

É necessário iniciar o frontend e o backend em terminais separados.

### Frontend Angular

Na raiz do repositório:

```bash
npm install
npm start
```

Abra [http://localhost:4200](http://localhost:4200).

### Backend NestJS

Em outro terminal:

```bash
cd backend
npm install
npm run start:dev
```

Abra [http://localhost:3000](http://localhost:3000). Enquanto a API estiver na fase inicial, a rota `GET /` responde `Hello World!`; isso confirma que o servidor está ativo.

Se a porta `3000` já estiver ocupada, identifique o processo antes de iniciar outra instância:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

## Estado atual

- [x] Frontend Angular inicial estruturado
- [x] Backend NestJS criado em `backend/` (`CONSCIOUS-34`)
- [ ] Cadastro e validação do projeto
- [ ] Leitura de repositórios públicos do GitHub
- [ ] Motor de análise e Conscious Score
- [ ] Dashboard com resultados
- [ ] Modo demonstração

## Convenções de colaboração

- Crie uma branch por entrega e não faça commits diretamente na `main`.
- Abra Pull Request e peça revisão de pelo menos uma pessoa.
- Use commits objetivos, por exemplo: `feat(backend): inicializa API NestJS`.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
