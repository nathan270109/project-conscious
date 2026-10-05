import { Injectable } from '@nestjs/common';
import saved from '../demo-data/analysis-result.json' with { type: 'json' };
import { validateAnalysisResult } from '../analysis/analysis-result.validator.js';
import type { CompletedAnalysisResult } from '../analysis/types/analysis.types.js';

@Injectable()
export class DemoService {
  getDemoAnalysis(): CompletedAnalysisResult {
    // O JSON é versionado; nunca é recalculado ou associado a outro projeto.
    validateAnalysisResult(saved);
    if (
      saved.status !== 'COMPLETED' || saved.demoMode !== true ||
      !saved.projectId || !Number.isFinite(Date.parse(saved.analyzedAt))
    ) throw new Error('Resultado demonstrativo inválido.');
    return structuredClone(saved) as CompletedAnalysisResult;
  }
}
