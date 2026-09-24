import { Module } from '@nestjs/common';
import { AccessibilityAnalyzer } from './analyzers/accessibility.analyzer.js';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';
import { TestsAnalyzer } from './analyzers/tests.analyzer.js';

@Module({
  providers: [
    DocumentationAnalyzer,
    TestsAnalyzer,
    AccessibilityAnalyzer,
  ],
  exports: [
    DocumentationAnalyzer,
    TestsAnalyzer,
    AccessibilityAnalyzer,
  ],
})
export class AnalysisModule { }
