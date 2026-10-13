export type AnalysisCategory =
  | 'DOCUMENTATION'
  | 'TESTS'
  | 'ACCESSIBILITY'
  | 'ORGANIZATION'
  | 'MAINTAINABILITY'

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Finding {
  ruleId: string;
  category: AnalysisCategory;
  severity: Severity;
  title: string;
  message: string;
  whyItMatters: string;
  remediation: string;
  evidence: string | null;
  file: string;
  line: number | null;
  occurrences: number;
}

export interface AnalyzerResult {
  category: AnalysisCategory;
  analyzedItems: number;
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

