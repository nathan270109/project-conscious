# Contrato de análise — Project Conscious

Este documento define o formato de dados compartilhado entre frontend, backend e motor de análise.

## Regras gerais

- Todos os campos usam `camelCase`.
- Datas usam o formato ISO 8601.
- O dashboard não deve criar chaves que não existam neste contrato.
- O motor de análise deve devolver exatamente estas chaves.
- `demoMode: true` identifica uma análise salva para demonstração; não representa uma análise criada naquele momento.

## Entrada de cadastro

```ts
type ProjectDraft = {
  name: string;
  repositoryUrl: string;
  description?: string;
};
```

- Exemplo
```json
{
  "name": "Project Conscious Demo",
  "repositoryUrl": "https://github.com/octocat/Hello-World",
  "description": "Repositório público usado na demonstração."
}
```

- TypeScript
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

- JSON
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
- JSON
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
    "message": "Não foi possível encontrar o repositório informado."
  }
}
```
Acordo de integração
- Integrante 3 deve usar este formato no mock do dashboard.
- Integrante 5 deve usar este formato como retorno do motor de análise.
- Integrante 4 deve devolver este formato no modo demonstração e, futuramente, na rota de resultado.
- Qualquer alteração neste contrato exige atualizar o mock, o motor e a documentação na mesma Pull Request.


## 3. Por que essas decisões importam

- `score: number | null`: evita inventar uma nota quando a análise falhar.
- `line: number | null`: mantém sempre a mesma chave, mesmo quando o risco não tiver linha específica.
- `dimensions: []` em falha: impede o dashboard de tentar mostrar dimensões inexistentes.
- Categorias e severidades em inglês e maiúsculas: são valores técnicos estáveis; o frontend traduz os rótulos exibidos.
- `demoMode`: deixa transparente para avaliadores quando o resultado vem de uma análise salva.

## 4. Revise antes do commit

Confirme que o documento contém:

- `ProjectDraft`;
- `Finding`;
- `AnalysisResult`;
- cinco dimensões;
- `COMPLETED` e `FAILED`;
- JSON de sucesso e falha;
- `demoMode`.

Então faça:

```bash
git add docs/api-contract.md
git commit -m "docs(api): publica contrato de resultado da análise"
git push origin docs/api-contract