import { Module } from '@nestjs/common';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';
import { MaintainabilityAnalyzer } from './analyzers/maintainability.analyzer.js';
import { OrganizationAnalyzer } from './analyzers/organization.analyzer.js';

@Module({
  providers: [
    DocumentationAnalyzer,
    OrganizationAnalyzer,
    MaintainabilityAnalyzer,
  ],
  exports: [
    DocumentationAnalyzer,
    OrganizationAnalyzer,
    MaintainabilityAnalyzer,
  ],
})
export class AnalysisModule {}