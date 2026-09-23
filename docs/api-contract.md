# Contrato de análise — Project Conscious

Este documento é a fonte única de verdade para a troca de dados entre o backend, o motor de análise e o dashboard.

## Objetivo e uso

- O backend deve devolver objetos neste formato.
- O Integrante 5 deve gerar findings e resultados compatíveis.
- O Integrante 3 deve criar o mock e renderizar o dashboard com estas mesmas chaves.
- O modo demonstração deve reutilizar `AnalysisResult` com `demoMode: true`.

> Este contrato descreve o resultado da análise. A rota definitiva de análise ainda será conectada; hoje, `POST /projects` cadastra somente o projeto validado.

## Convenções

- Campos usam `camelCase`.
- Datas usam ISO 8601 em UTC.
- Notas estão entre `0` e `100`.
- Valores técnicos de categoria e severidade usam inglês em maiúsculas. O frontend traduz apenas o rótulo exibido.
- Um `Finding` sempre informa `file` e `line`. Quando não houver linha precisa, use `null`.

## Entrada de cadastro

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

## Tipos do resultado

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

- [ ] O mock do dashboard possui as mesmas chaves de `AnalysisResult`.
- [ ] O retorno do motor de análise possui as mesmas chaves de `AnalysisResult`.
- [ ] O JSON do modo demonstração usa `demoMode: true` e contém evidências reais do repositório-demo.
- [ ] O frontend trata `COMPLETED` e `FAILED` sem criar campos próprios.

## Alterações no contrato

Qualquer alteração de chave, tipo ou significado deve ocorrer na mesma Pull Request que atualiza o backend, o mock do dashboard e o motor de análise. Não adicione campos locais sem registrar a mudança neste documento.
