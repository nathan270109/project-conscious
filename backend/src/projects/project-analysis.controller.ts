import {
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import type { CompletedAnalysisResult } from '../analysis/types/analysis.types.js';
import { ProjectAnalysisService } from './project-analysis.service.js';

@Controller('projects')
export class ProjectAnalysisController {
  constructor(
    private readonly projectAnalysisService: ProjectAnalysisService,
  ) {}

  @Post(':id/analyze')
  @HttpCode(HttpStatus.OK)
  async analyze(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    projectId: string,
  ): Promise<CompletedAnalysisResult> {
    const result = await this.projectAnalysisService.analyze(projectId);

    if (result.status === 'FAILED') {
      const status =
        result.error.code === 'REPOSITORY_NOT_FOUND'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(result, status);
    }

    return result;
  }
}