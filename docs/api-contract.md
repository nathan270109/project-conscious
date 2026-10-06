# Contrato de análise — Project Conscious

Este documento é a fonte única de verdade para a troca de dados entre o backend, o motor de análise e o dashboard.

## Objetivo e uso

- O backend deve devolver objetos neste formato.
- O Integrante 5 deve gerar findings e resultados compatíveis.
- O Integrante 3 deve criar o mock e renderizar o dashboard com estas mesmas chaves.
- O modo demonstração deve reutilizar `AnalysisResult` com `demoMode: true`.

> Este contrato descreve o resultado da análise. `POST /projects` cadastra o projeto; `POST /projects/:id/analyze` executa o motor real com o UUID retornado. O Angular consome essas rotas. `GET /demo/analysis` fornece a análise demonstrativa salva; o Angular também inclui esse mesmo JSON para uso local sem API.

## Fluxo da interface

1. O formulário cadastra pela API, preserva `id`/`createdAt` e guarda os metadados na sessão pelo `AnalysisService`.
2. A rota `/projects/:id/scanning` consulta esses metadados e inicia uma única análise. O formulário não inicia a análise.
3. O scanning mostra espera indeterminada. A lista de estrutura e cinco dimensões é explicativa, não progresso recebido do backend.
4. Depois de validar e guardar `COMPLETED` ou `FAILED`, o serviço permite que a tela abra `/projects/:id/dashboard` com o mesmo ID. Erros de transporte, timeout ou resposta incompatível permanecem no scanning com recuperação.

Nova tentativa após erro de transporte usa o mesmo projeto, sem cadastro adicional. Ela pode repetir processamento no servidor após timeout; encerrar a assinatura do Angular não garante cancelar o motor. Se já houver resultado válido guardado, voltar ao scanning apenas tenta abrir o dashboard novamente, sem reanalisar.

Metadados e resultados reais ficam somente em memória no frontend. Acesso direto ou recarregamento sem metadados no scanning oferece um novo cadastro; não inventa projeto nem seleciona demo automaticamente. O dashboard continua exibindo o demo salvo independentemente desses metadados.

## Convenções

- Campos usam `camelCase`.
- Datas usam ISO 8601 em UTC.
- Notas estão entre `0` e `100`.
- Valores técnicos de categoria e severidade usam inglês em maiúsculas. O frontend traduz apenas o rótulo exibido.
- Um `Finding` sempre informa `file` e `line`. Quando não houver linha precisa, use `null`.

## Entrada de cadastro

### Validação e normalização

`POST /projects` normaliza espaços nas pontas dos textos antes de validar. O backend é a autoridade das regras; o formulário também verifica os mesmos limites e a política de URL.

| Campo | Regra |
| --- | --- |
| `name` | Texto obrigatório, de 3 a 100 caracteres após normalização. Nome somente com espaços é inválido. |
| `description` | Texto opcional, até 2000 caracteres após normalização. Pode ser omitido ou vazio; `null`, objetos e arrays são inválidos. |
| `repositoryUrl` | Texto obrigatório, até 2048 caracteres, URL direta `https://github.com/owner/repo`. Aceita `.git` e uma barra final. |

A política de URL desta aplicação aceita owner de 1 a 39 caracteres alfanuméricos/hífens, iniciando e terminando por caractere alfanumérico; o nome do repositório tem de 1 a 100 caracteres alfanuméricos, ponto, hífen ou underscore, sem contar o sufixo `.git`. `.` e `..` não são nomes aceitos. Esta é a política de entrada do MVP, não uma afirmação de suporte a todos os formatos possíveis do GitHub.

Não são aceitos HTTP, outros domínios, credenciais embutidas, portas explícitas (inclusive `:443`), query/fragmento (mesmo vazios), caminhos extras como `/tree/main`, segmentos codificados com `%` ou caminhos normalizados por `..`. O nome e a URL não são convertidos de números/objetos para texto.

O cadastro não verifica a existência nem a visibilidade do repositório: essa consulta ocorre durante a análise. Uma URL sintaticamente válida de repositório inexistente ainda pode ser cadastrada. Entrada inválida retorna HTTP 400 com mensagens de validação, sem criar projeto ou consultar o GitHub; campos adicionais não previstos também são rejeitados.

ID e `createdAt` continuam sendo gerados pelo backend. As regras não adicionam campos ao resultado da análise. Normalização da URL remove apenas espaços nas pontas no cadastro; o serviço do GitHub interpreta o sufixo `.git` na consulta.

```ts
type ProjectDraft = {
  name: string;
  repositoryUrl: string;
  description?: string;
};
```

Exemplo:

```json
{
  "name": "Project Conscious Demo",
  "repositoryUrl": "https://github.com/octocat/Hello-World",
  "description": "Repositório público usado na demonstração."
}
```

## Rota de análise

`POST /projects/:id/analyze` está registrada no `ProjectsModule`. O motor executa
os cinco analisadores, calcula as notas pelo ScoringService, ordena os findings
pelo RisksService e gera o insight. Os testes do AppModule mantêm esses serviços
reais e simulam apenas a consulta ao GitHub nos cenários normais.

- `id`: UUID v4 retornado pelo cadastro `POST /projects`.
- Corpo da requisição de análise: não é necessário.
- Projetos são armazenados em memória; reiniciar o backend invalida os IDs.

| Caso | HTTP | Corpo |
| --- | --- | --- |
| Análise concluída | 200 | `AnalysisResult`, `status: COMPLETED` |
| ID inválido | 400 | Erro de validação padrão do NestJS |
| Projeto inexistente | 404 | Erro padrão com mensagem `Projeto não encontrado.` |
| Repositório inexistente | 404 | `AnalysisResult`, `FAILED`, código `REPOSITORY_NOT_FOUND` |
| Outras falhas externas ou do motor | 500 | `AnalysisResult`, `FAILED`, código `ANALYSIS_FAILED` |

O frontend deve ler o corpo das respostas HTTP de erro: nem todo erro tem formato
`AnalysisResult`. As respostas completas de sucesso e falha são exemplificadas
abaixo; são ilustrativas, não evidências reais de demonstração. A análise normal
usa `demoMode: false`; o exemplo salvo demonstra o formato com `demoMode: true`.

```bash
curl -X POST http://localhost:3000/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Projeto exemplo","repositoryUrl":"https://github.com/octocat/Hello-World"}'

# Substitua UUID_RETORNADO pelo id do cadastro.
curl -i -X POST http://localhost:3000/projects/UUID_RETORNADO/analyze
```

Na análise, erros de rede/acesso/limite do GitHub são convertidos para a resposta
segura `ANALYSIS_FAILED` (500); isso é diferente do 503 exposto pela leitura direta
de arquivos. Tokens, mensagens internas e stack traces não são enviados no corpo
de `FAILED`.

## Tipos do resultado

### Resultado demonstrativo salvo

`GET /demo/analysis` retorna HTTP 200 e um `CompletedAnalysisResult` com
`demoMode: true`, sem consultar o GitHub. Fonte única do resultado:
`backend/src/demo-data/analysis-result.json`. A origem e a revisão dos arquivos
analisados ficam no snapshot separado; não são adicionadas chaves ao contrato.

- Repositório: `https://github.com/katherinykamili/project-conscious-demo`.
- Revisão: `2770289e71c3ea7ef0e89ba056f67ba99f4110ee`.
- UUID exclusivo do demo: `8e5ab4e0-42c9-4d06-a917-6639d1dfe038`.
- `analyzedAt` é a data salva da geração, não o horário de abertura do dashboard.
- A interface identifica “Modo demonstração: análise salva” e sua origem.
- A seleção é explícita; falhas em projetos reais não mudam sua identidade
  nem retornam dados do demo no lugar do resultado daquele projeto.

Os exemplos abaixo permanecem ilustrativos. O JSON versionado contém a saída
do motor real sobre os arquivos da revisão indicada.

```ts
type AnalysisStatus = 'COMPLETED' | 'FAILED';

type AnalysisCategory =
  | 'DOCUMENTATION'
  | 'TESTS'
  | 'ACCESSIBILITY'
  | 'ORGANIZATION'
  | 'MAINTAINABILITY';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type DimensionScore = {
  category: AnalysisCategory;
  score: number;
};

type Finding = {
  category: AnalysisCategory;
  severity: Severity;
  message: string;
  file: string;
  line: number | null;
};

type Insight = {
  category: AnalysisCategory;
  title: string;
  message: string;
};

type AnalysisError = {
  code: string;
  message: string;
};

type AnalysisResult = {
  projectId: string;
  status: AnalysisStatus;
  analyzedAt: string;
  demoMode?: boolean;
  score: number | null;
  dimensions: DimensionScore[];
  findings: Finding[];
  insight: Insight | null;
  error?: AnalysisError;
};
```

## Regras por status

| Status | `score` | `dimensions` e `findings` | `insight` | `error` |
| --- | --- | --- | --- | --- |
| `COMPLETED` | número de 0 a 100 | cinco dimensões; findings pode ser vazio | obrigatório | ausente |
| `FAILED` | `null` | arrays vazios | `null` | obrigatório |

Em uma análise concluída, cada categoria deve aparecer exatamente uma vez em `dimensions`.

### Interpretação do insight na integração em desenvolvimento

Sem alterar os campos publicados, o backend usa a menor nota de `dimensions`
como contexto de `message` e o primeiro finding já ordenado como ação prioritária.
`insight.category` representa a categoria dessa ação, não necessariamente a pior
dimensão. Empates de menor nota são mencionados em ordem fixa das cinco categorias.
Sem findings, a mensagem é neutra e `DOCUMENTATION` é apenas uma categoria
convencional, nunca indicação de deficiência. Essa interpretação foi aprovada
por Katheriny para a implementação; o alinhamento dos consumidores com a equipe
ainda está pendente. Os exemplos abaixo ilustram o formato, não textos fixos
nem resultados reais do novo gerador.

## Exemplo: análise concluída

```json
{
  "projectId": "a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad",
  "status": "COMPLETED",
  "analyzedAt": "2026-09-23T18:00:00.000Z",
  "demoMode": true,
  "score": 78,
  "dimensions": [
    { "category": "DOCUMENTATION", "score": 70 },
    { "category": "TESTS", "score": 60 },
    { "category": "ACCESSIBILITY", "score": 75 },
    { "category": "ORGANIZATION", "score": 90 },
    { "category": "MAINTAINABILITY", "score": 95 }
  ],
  "findings": [
    {
      "category": "ACCESSIBILITY",
      "severity": "HIGH",
      "message": "Imagem sem texto alternativo.",
      "file": "src/app/profile/profile.component.html",
      "line": 12
    }
  ],
  "insight": {
    "category": "ACCESSIBILITY",
    "title": "Priorize a acessibilidade",
    "message": "Corrija primeiro as imagens sem texto alternativo para melhorar a navegação por tecnologias assistivas."
  }
}
```

## Exemplo: análise com falha

```json
{
  "projectId": "a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad",
  "status": "FAILED",
  "analyzedAt": "2026-09-23T18:00:00.000Z",
  "score": null,
  "dimensions": [],
  "findings": [],
  "insight": null,
  "error": {
    "code": "REPOSITORY_NOT_FOUND",
    "message": "Não foi possível encontrar o repositório público informado."
  }
}
```

## Checklist de integração

Antes de integrar uma nova frente, confirme:

- [x] A fixture ilustrativa de testes possui as mesmas chaves de `AnalysisResult`.
- [x] O retorno da análise real possui as mesmas chaves de `AnalysisResult`.
- [x] O JSON do modo demonstração usa `demoMode: true` e reproduz a saída do motor sobre a revisão registrada do repositório-demo.
- [x] O frontend trata `COMPLETED` e `FAILED` sem criar campos próprios.

## Alterações no contrato

Qualquer alteração de chave, tipo ou significado deve ocorrer na mesma Pull Request que atualiza o backend, o mock do dashboard e o motor de análise. Não adicione campos locais sem registrar a mudança neste documento.
