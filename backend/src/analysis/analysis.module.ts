import { Module } from '@nestjs/common';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer.js';
import { TestsAnalyzer } from './analyzers/tests.analyzer.js';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';
import { MaintainabilityAnalyzer } from './analyzers/maintainability.analyzer.js';
import { OrganizationAnalyzer } from './analyzers/organization.analyzer.js';

@Module({
  providers: [
    TestsAnalyzer,
    AccessibilityAnalyzer,
    DocumentationAnalyzer,
    OrganizationAnalyzer,
    MaintainabilityAnalyzer,
  ],
  exports: [
    TestsAnalyzer,
    AccessibilityAnalyzer,
    DocumentationAnalyzer,
    OrganizationAnalyzer,
    MaintainabilityAnalyzer,
  ],
})
export class AnalysisModule {}
