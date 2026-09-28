import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ANALYSIS_ENGINE } from '../analysis/analysis-engine.interface.js';
import type { AnalysisEngine } from '../analysis/analysis-engine.interface.js';
import { validateAnalysisResult } from '../analysis/analysis-result.validator.js';
import type { AnalysisResult } from '../analysis/types/analysis.types.js';
import { ProjectsService } from './projects.service.js';

@Injectable()
export class ProjectAnalysisService {
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject(ANALYSIS_ENGINE)
    private readonly analysisEngine: AnalysisEngine,
  ) {}

  async analyze(projectId: string): Promise<AnalysisResult> {
    // Confirma a existência antes de tratar as falhas da análise.
    this.projectsService.findById(projectId);
    let filesLoaded = false;

    try {
      const files = await this.projectsService.getProjectFiles(projectId);
      filesLoaded = true;

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
    } catch (error) {
      const repositoryNotFound =
        !filesLoaded && error instanceof NotFoundException;

      return {
        projectId,
        status: 'FAILED',
        analyzedAt: new Date().toISOString(),
        demoMode: false,
        score: null,
        dimensions: [],
        findings: [],
        insight: null,
        error: {
          code: repositoryNotFound ? 'REPOSITORY_NOT_FOUND' : 'ANALYSIS_FAILED',
          message: repositoryNotFound
            ? 'Não foi possível encontrar o repositório público informado.'
            : 'Não foi possível concluir a análise. Tente novamente mais tarde.',
        },
      };
    }
  }
}
