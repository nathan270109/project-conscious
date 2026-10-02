import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { GithubModule } from '../github/github.module.js';
import { AnalysisModule } from '../analysis/analysis.module.js';
import { ProjectAnalysisController } from './project-analysis.controller.js';
import { ProjectAnalysisService } from './project-analysis.service.js';

@Module({
  controllers: [ProjectsController, ProjectAnalysisController],
  providers: [ProjectsService, ProjectAnalysisService],
  imports: [GithubModule, AnalysisModule],
})
export class ProjectsModule {}
