import { RepositoryFile } from '../github/github.service.js';
import {
  DimensionScore,
  Finding,
  Insight,
} from './types/analysis.types.js';

export const ANALYSIS_ENGINE = Symbol('ANALYSIS_ENGINE');

export interface AnalysisEngineOutput {
  score: number;
  dimensions: DimensionScore[];
  findings: Finding[];
  insight: Insight;
}

export interface AnalysisEngine {
  analyze(
    files: RepositoryFile[],
  ): AnalysisEngineOutput | Promise<AnalysisEngineOutput>;
}
