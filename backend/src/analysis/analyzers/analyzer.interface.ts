import { RepositoryFile } from '../../github/github.service.js';
import { AnalyzerResult } from '../types/analysis.types.js';
import type { RepositoryProfile } from '../repository-profiler.service.js';

export interface Analyzer {
  analyze(files: RepositoryFile[], profile: RepositoryProfile): AnalyzerResult;
}
