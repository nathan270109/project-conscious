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
    spies.forEach((spy) => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBe(files);
      expect(spy.mock.calls[0][1]).toEqual(expect.objectContaining({ sourceFiles: expect.any(Array) }));
    });
    const analyzerResults = spies.map((spy) => spy.mock.results[0].value);
    const findings = analyzerResults.flatMap((analysis) => analysis.findings);
    expect(scoring).toHaveBeenCalledExactlyOnceWith(analyzerResults);
    expect(risks).toHaveBeenCalledExactlyOnceWith(findings);
    expect(insights).toHaveBeenCalledExactlyOnceWith(
      result.dimensions,
      result.findings,
    );
    expect(result.score).toBeGreaterThan(0);
    expect(result.dimensions).toHaveLength(5);
    expect(result.findings.every((finding) => finding.ruleId && finding.remediation)).toBe(true);
    expect(result.insight.message).toContain(result.findings[0].message);
    expect(files).toEqual(original);
  });

  it('produz notas máximas e insight neutro quando não há findings', async () => {
    const result = await engine.analyze([
      { path: 'package.json', content: '{"scripts":{"start":"node .","test":"vitest"}}' },
      {
        path: 'README.md',
        content: '# Produto\nEste produto oferece uma descrição extensa de propósito, público, capacidades e limites para orientar contribuidores.\n## Instalação\nnpm install\n## Execução\nnpm run start\n## Testes\nnpm test',
      },
      { path: 'src/app.html', content: '<main><img src="logo" alt="Logo"></main>' },
      { path: 'src/main.ts', content: 'export const value = 1;' },
      { path: 'src/main.spec.ts', content: 'test("value",()=>expect(1).toBe(1));' },
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
