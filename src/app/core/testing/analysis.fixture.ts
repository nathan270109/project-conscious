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
        category: 'DOCUMENTATION',
        severity: 'HIGH',
        message: 'README sem instruções de execução',
        file: 'README.md',
        line: null,
      },
      {
        category: 'ACCESSIBILITY',
        severity: 'HIGH',
        message: 'Imagem sem atributo alt',
        file: 'src/app/feats/home/home.html',
        line: 34,
      },
      {
        category: 'TESTS',
        severity: 'MEDIUM',
        message: 'Área importante do projeto sem arquivo de teste',
        file: 'src/app/feats/home/home.ts',
        line: null,
      },
      {
        category: 'MAINTAINABILITY',
        severity: 'LOW',
        message: 'console.log encontrado no código',
        file: 'src/app/feats/home/home.ts',
        line: 18,
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
