export type AnalysisCategory =
| 'DOCUMENTATION'
| 'TESTS'
| 'ACCESSIBILITY'
| 'ORGANIZATION'
| 'MAINTAINABILITY'

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Finding {
  category: AnalysisCategory;
  severity: Severity;
  message: string;
  file: string;
  line: number | null;
}

export interface AnalyzerResult {
  category: AnalysisCategory;
  score: number;
  findings: Finding[];
}