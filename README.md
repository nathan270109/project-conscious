# ProjectConscious

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Development server

### Fluxo integrado com o backend

Em um terminal, a partir da raiz:

```bash
cd backend
npm run start:dev
```

Em outro terminal, na raiz:

```bash
npm start
```

Abra `http://localhost:4200/projects/new`. O formulário cadastra o projeto,
usa o UUID recebido para analisar o repositório e abre o dashboard com o resultado
real. Aguarde a conclusão; os campos ficam bloqueados durante as requisições.

`proxy.conf.json` encaminha `/api/**` para `http://127.0.0.1:3000`, removendo
o prefixo `/api`. Isso mantém o navegador na mesma origem, sem liberar CORS
globalmente no backend. Se a porta do backend mudar, ajuste o target do proxy.
O proxy só funciona no servidor de desenvolvimento: em produção, configure o
servidor/reverse proxy para encaminhar `/api/` ao backend e servir o Angular nas
demais rotas. Não use o fallback de HTML para requisições `/api/`.

O resultado fica em memória nesta sessão do Angular. Recarregar a página ou abrir
o link em outra aba exige nova análise; não existe GET de resultado persistido.
O frontend não substitui falhas por mock. A fixture ilustrativa está apenas em
`src/app/core/testing/analysis.fixture.ts`, usada nos testes. O modo demo offline
real continua pendente (CONSCIOUS-39/47).

Cada requisição tem limite de espera de 60 segundos. Sair do formulário cancela
a assinatura HTTP local; isso não garante cancelamento do processamento já iniciado
no servidor. Erros FAILED válidos são exibidos no dashboard; falhas de rede,
cadastro, timeout ou resposta incompatível são apresentadas no formulário.

Validação automatizada:

```bash
npm test -- --watch=false
npm run build
```

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
