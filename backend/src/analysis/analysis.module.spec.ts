import { Test } from '@nestjs/testing';
import { AnalysisModule } from './analysis.module.js';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer.js';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';
import { MaintainabilityAnalyzer } from './analyzers/maintainability.analyzer.js';
import { OrganizationAnalyzer } from './analyzers/organization.analyzer.js';
import { TestsAnalyzer } from './analyzers/tests.analyzer.js';

describe('AnalysisModule', () => {
  it('exporta os cinco analisadores preservando as entregas existentes', async () => {
    const analyzers = [
      DocumentationAnalyzer,
      TestsAnalyzer,
      AccessibilityAnalyzer,
      OrganizationAnalyzer,
      MaintainabilityAnalyzer,
    ];
    const consumer = await Test.createTestingModule({
      imports: [AnalysisModule],
      providers: [
        {
          provide: 'ANALYZERS_CONSUMER',
          inject: analyzers,
          useFactory: (...instances: unknown[]) => instances,
        },
      ],
    }).compile();

    try {
      const instances = consumer.get<unknown[]>('ANALYZERS_CONSUMER');
      expect(instances).toHaveLength(5);
      analyzers.forEach((analyzer, index) => {
        expect(instances[index]).toBeInstanceOf(analyzer);
      });
    } finally {
      await consumer.close();
    }
  });
});
