import { RepositoryFile } from '../../github/github.service.js';
import { AnalyzerResult } from '../types/analysis.types.js';

export interface Analyzer {
  analyze(files: RepositoryFile[]): AnalyzerResult;
}