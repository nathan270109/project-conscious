import type { CompletedAnalysisResult } from '../models/analysis-result.model';
// Fixture ilustrativa exclusiva de testes; não é contingência real.
export function createAnalysisFixture(): CompletedAnalysisResult {
  return {
    projectId: '1',
    status: 'COMPLETED',
    analyzedAt: '2026-09-29T12:00:00.000Z',
    score: 80,
    dimensions: [
      { category: 'DOCUMENTATION', score: 65 },
      { category: 'TESTS', score: 95 },
      { category: 'ACCESSIBILITY', score: 60 },
      { category: 'ORGANIZATION', score: 100 },
      { category: 'MAINTAINABILITY', score: 80 },
    ],
    findings: [
      {
        ruleId: 'DOC004',
        category: 'DOCUMENTATION',
        severity: 'HIGH',
        title: 'Execução local não está demonstrada',
        message: 'README sem instruções de execução',
        whyItMatters: 'Novos contribuidores não sabem como iniciar o projeto.',
        remediation: 'Documente o comando real de execução.',
        evidence: null,
        file: 'README.md',
        line: null,
        occurrences: 1,
      },
      {
        ruleId: 'A11Y001',
        category: 'ACCESSIBILITY',
        severity: 'HIGH',
        title: 'Imagem sem alternativa textual definida',
        message: 'Imagem sem atributo alt',
        whyItMatters: 'Leitores de tela não recebem a informação da imagem.',
        remediation: 'Adicione alt descritivo ou vazio quando decorativa.',
        evidence: '<img src="hero.png">',
        file: 'src/app/feats/home/home.html',
        line: 34,
        occurrences: 1,
      },
      {
        ruleId: 'TEST007',
        category: 'TESTS',
        severity: 'MEDIUM',
        title: 'Distribuição de testes muito baixa',
        message: 'Área importante do projeto sem arquivo de teste',
        whyItMatters: 'Regressões podem passar sem detecção.',
        remediation: 'Adicione testes para o fluxo principal.',
        evidence: null,
        file: 'src/app/feats/home/home.ts',
        line: null,
        occurrences: 1,
      },
      {
        ruleId: 'MAINT001',
        category: 'MAINTAINABILITY',
        severity: 'LOW',
        title: 'Log de depuração em código de produção',
        message: 'console.log encontrado no código',
        whyItMatters: 'Logs não estruturados dificultam a observabilidade.',
        remediation: 'Remova o log ou use logger estruturado.',
        evidence: 'console.log("debug")',
        file: 'src/app/feats/home/home.ts',
        line: 18,
        occurrences: 1,
      },
    ],
    insight: {
      category: 'DOCUMENTATION',
      title: 'Comece pela documentação',
      message:
        'Acessibilidade apresentou a menor nota: 60/100. ' +
        'Como primeira ação, revise o apontamento de documentação: ' +
        'README sem instruções de execução. ' +
        'Revise esse apontamento no arquivo README.md.',
    },
    demoMode: true,
  };
}
