import type { AnalyzerResult, AnalysisCategory, Finding, Severity } from '../analysis/types/analysis.types.js';
import { ScoringService } from './scoring.service.js';

const finding = (severity: Severity, occurrences = 1): Finding => ({
  ruleId: 'RULE001', category: 'DOCUMENTATION', severity, title: 'Problema', message: 'Descrição',
  whyItMatters: 'Impacto', remediation: 'Correção', evidence: null, file: 'file.ts', line: null, occurrences,
});
const categories: AnalysisCategory[] = ['DOCUMENTATION', 'TESTS', 'ACCESSIBILITY', 'ORGANIZATION', 'MAINTAINABILITY'];
const results = (documentation: Finding[] = []): AnalyzerResult[] => categories.map((category) => ({
  category, analyzedItems: 1, findings: category === 'DOCUMENTATION' ? documentation : [],
}));

describe('ScoringService', () => {
  const service = new ScoringService();
  it('returns 100 only for executed analyzers without findings', () => {
    expect(service.calculate(results()).score).toBe(100);
    expect(service.calculate([]).dimensions.every((dimension) => dimension.score === 0)).toBe(true);
  });
  it('uses severity and capped logarithmic repetition penalties', () => {
    expect(service.calculate(results([finding('HIGH')])).dimensions[0].score).toBe(75);
    const repeated = service.calculate(results([finding('LOW', 16)])).dimensions[0].score;
    expect(repeated).toBe(93);
  });
  it('never returns a dimension below zero', () => {
    expect(service.calculate(results([finding('CRITICAL'), finding('CRITICAL'), finding('CRITICAL')])).dimensions[0].score).toBe(0);
  });
});
