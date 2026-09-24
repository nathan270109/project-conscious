import { Module } from '@nestjs/common';
import { DocumentationAnalyzer } from './analyzers/documentation.analyzer.js';

@Module({
  providers: [DocumentationAnalyzer],
  exports: [DocumentationAnalyzer],
  
})
export class AnalysisModule {}