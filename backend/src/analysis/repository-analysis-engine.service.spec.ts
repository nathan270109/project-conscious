import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { AnalysisModule } from './analysis.module.js';
import { ANALYSIS_ENGINE } from './analysis-engine.interface.js';
import type { AnalysisEngine } from './analysis-engine.interface.js';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';
import { TestsAnalyzer } from './analyzers/tests.analyzer.js';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer.js';
import { OrganizationAnalyzer } from './analyzers/organization.analyzer.js';
import { MaintainabilityAnalyzer } from './analyzers/maintainability.analyzer.js';
import { ScoringService } from '../scoring/scoring.service.js';
import { RisksService } from '../risks/risks.service.js';
import { InsightsService } from '../insights/insights.service.js';

describe('RepositoryAnalysisEngine', () => {
  let module: TestingModule;
  let engine: AnalysisEngine;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AnalysisModule],
    }).compile();
    engine = module.get<AnalysisEngine>(ANALYSIS_ENGINE);
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await module.close();
  });

  it('executa os cinco analisadores e encadeia score, riscos e insight reais', async () => {
    const analyzers = [
      DocumentationAnalyzer,
      TestsAnalyzer,
      AccessibilityAnalyzer,
      OrganizationAnalyzer,
      MaintainabilityAnalyzer,
    ];
    const spies = analyzers.map((type) =>
      vi.spyOn(module.get(type), 'analyze'),
    );
    const scoring = vi.spyOn(module.get(ScoringService), 'calculate');
    const risks = vi.spyOn(module.get(RisksService), 'sortByPriority');
    const insights = vi.spyOn(module.get(InsightsService), 'generate');
    const files = [
      { path: 'BadName.html', content: '<img src="logo.png">' },
      { path: 'src/main.ts', content: 'console.log("hello");' },
    ];
    const original = structuredClone(files);
    const result = await engine.analyze(files);
    spies.forEach((spy) => expect(spy).toHaveBeenCalledExactlyOnceWith(files));
    const findings = spies.flatMap((spy) => spy.mock.results[0].value.findings);
    expect(scoring).toHaveBeenCalledExactlyOnceWith(findings);
    expect(risks).toHaveBeenCalledExactlyOnceWith(findings);
    expect(insights).toHaveBeenCalledExactlyOnceWith(
      result.dimensions,
      result.findings,
    );
    expect(result.score).toBe(83);
    expect(result.dimensions).toEqual([
      { category: 'DOCUMENTATION', score: 75 },
      { category: 'TESTS', score: 75 },
      { category: 'ACCESSIBILITY', score: 75 },
      { category: 'ORGANIZATION', score: 95 },
      { category: 'MAINTAINABILITY', score: 95 },
    ]);
    expect(result.findings.map((f) => f.category)).toEqual([
      'ACCESSIBILITY',
      'DOCUMENTATION',
      'TESTS',
      'MAINTAINABILITY',
      'ORGANIZATION',
    ]);
    expect(result.insight.category).toBe('ACCESSIBILITY');
    expect(result.insight.message).toContain(result.findings[0].message);
    expect(files).toEqual(original);
  });

  it('produz notas máximas e insight neutro quando não há findings', async () => {
    const result = await engine.analyze([
      {
        path: 'README.md',
        content: 'Descrição do projeto. npm install. npm start.',
      },
      { path: 'src/main.spec.ts', content: '' },
    ]);
    expect(result.score).toBe(100);
    expect(result.dimensions).toHaveLength(5);
    expect(result.dimensions.every((d) => d.score === 100)).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.insight.title).toBe('Nenhum risco identificado');
  });

  it('não calcula um resultado parcial quando um analisador falha', () => {
    vi.spyOn(module.get(AccessibilityAnalyzer), 'analyze').mockImplementation(
      () => {
        throw new Error('Falha interna');
      },
    );
    const scoring = vi.spyOn(module.get(ScoringService), 'calculate');
    const insights = vi.spyOn(module.get(InsightsService), 'generate');
    expect(() => engine.analyze([])).toThrow('Falha interna');
    expect(scoring).not.toHaveBeenCalled();
    expect(insights).not.toHaveBeenCalled();
  });
});
