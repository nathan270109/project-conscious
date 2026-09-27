import { Inject, Injectable } from '@nestjs/common';
import { ANALYSIS_ENGINE } from '../analysis/analysis-engine.interface.js';
import type { AnalysisEngine } from '../analysis/analysis-engine.interface.js';
import type { CompletedAnalysisResult } from '../analysis/types/analysis.types.js';
import { ProjectsService } from './projects.service.js';
import { validateAnalysisResult } from '../analysis/analysis-result.validator.js';

@Injectable()
export class ProjectAnalysisService {
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject(ANALYSIS_ENGINE)
    private readonly analysisEngine: AnalysisEngine,
  ) {}

  async analyze(projectId: string): Promise<CompletedAnalysisResult> {
    const files = await this.projectsService.getProjectFiles(projectId);
    const result = await this.analysisEngine.analyze(files);

    validateAnalysisResult(result);

    return {
      projectId,
      status: 'COMPLETED',
      analyzedAt: new Date().toISOString(),
      demoMode: false,
      score: result.score,
      dimensions: result.dimensions,
      findings: result.findings,
      insight: result.insight,
    };
  }
}
