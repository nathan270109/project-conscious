import { Module } from '@nestjs/common';
import { ScoringModule } from '../scoring/scoring.module.js';
import { RisksModule } from '../risks/risks.module.js';
import { InsightsModule } from '../insights/insights.module.js';
import { ANALYSIS_ENGINE } from './analysis-engine.interface.js';
import { RepositoryAnalysisEngine } from './repository-analysis-engine.service.js';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer.js';
import { TestsAnalyzer } from './analyzers/tests.analyzer.js';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';
import { MaintainabilityAnalyzer } from './analyzers/maintainability.analyzer.js';
import { OrganizationAnalyzer } from './analyzers/organization.analyzer.js';

@Module({
  imports: [ScoringModule, RisksModule, InsightsModule],
  providers: [
    RepositoryAnalysisEngine,
    { provide: ANALYSIS_ENGINE, useExisting: RepositoryAnalysisEngine },
    TestsAnalyzer,
    AccessibilityAnalyzer,
    DocumentationAnalyzer,
    OrganizationAnalyzer,
    MaintainabilityAnalyzer,
  ],
  exports: [
    ANALYSIS_ENGINE,
    TestsAnalyzer,
    AccessibilityAnalyzer,
    DocumentationAnalyzer,
    OrganizationAnalyzer,
    MaintainabilityAnalyzer,
  ],
})
export class AnalysisModule {}
