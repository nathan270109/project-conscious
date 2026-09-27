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

export interface DimensionScore {
  category: AnalysisCategory;
  score: number;
}

export interface Insight {
  category: AnalysisCategory;
  title: string;
  message: string;
}

export interface AnalysisError {
  code: string;
  message: string;
}

interface AnalysisResultBase {
  projectId: string;
  analyzedAt: string;
  demoMode?: boolean;
}

export interface CompletedAnalysisResult extends AnalysisResultBase {
  status: 'COMPLETED';
  score: number;
  dimensions: DimensionScore[];
  findings: Finding[];
  insight: Insight;
  error?: never;
}

export interface FailedAnalysisResult extends AnalysisResultBase {
  status: 'FAILED';
  score: null;
  dimensions: [];
  findings: [];
  insight: null;
  error: AnalysisError;
}

export type AnalysisResult =
  | CompletedAnalysisResult
  | FailedAnalysisResult;
  