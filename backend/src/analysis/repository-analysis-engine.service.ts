import { Injectable } from '@nestjs/common';
import type { RepositoryFile } from '../github/github.service.js';
import type {
  AnalysisEngine,
  AnalysisEngineOutput,
} from './analysis-engine.interface.js';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';
import { TestsAnalyzer } from './analyzers/tests.analyzer.js';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer.js';
import { OrganizationAnalyzer } from './analyzers/organization.analyzer.js';
import { MaintainabilityAnalyzer } from './analyzers/maintainability.analyzer.js';
import { ScoringService } from '../scoring/scoring.service.js';
import { RisksService } from '../risks/risks.service.js';
import { InsightsService } from '../insights/insights.service.js';

@Injectable()
export class RepositoryAnalysisEngine implements AnalysisEngine {
  constructor(
    private readonly documentation: DocumentationAnalyzer,
    private readonly tests: TestsAnalyzer,
    private readonly accessibility: AccessibilityAnalyzer,
    private readonly organization: OrganizationAnalyzer,
    private readonly maintainability: MaintainabilityAnalyzer,
    private readonly scoring: ScoringService,
    private readonly risks: RisksService,
    private readonly insights: InsightsService,
  ) {}

  analyze(files: RepositoryFile[]): AnalysisEngineOutput {
    // Falhas interrompem a análise; não substituímos categorias não analisadas por 100.
    const findings = [
      this.documentation,
      this.tests,
      this.accessibility,
      this.organization,
      this.maintainability,
    ].flatMap((analyzer) => analyzer.analyze(files).findings);

    // As notas finais seguem exclusivamente as penalidades do ScoringService.
    const { score, dimensions } = this.scoring.calculate(findings);
    const orderedFindings = this.risks.sortByPriority(findings);

    return {
      score,
      dimensions,
      findings: orderedFindings,
      insight: this.insights.generate(dimensions, orderedFindings),
    };
  }
}
