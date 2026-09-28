import { NotFoundException } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ProjectAnalysisController } from '../src/projects/project-analysis.controller.js';
import { ProjectAnalysisService } from '../src/projects/project-analysis.service.js';
import type {
  CompletedAnalysisResult,
  FailedAnalysisResult,
} from '../src/analysis/types/analysis.types.js';

describe('POST /projects/:id/analyze', () => {
  let app: INestApplication;

  const analyze = vi.fn<ProjectAnalysisService['analyze']>();
  const projectId = 'a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad';

  const completedResult: CompletedAnalysisResult = {
    projectId,
    status: 'COMPLETED',
    analyzedAt: '2026-09-28T12:00:00.000Z',
    demoMode: false,
    score: 100,
    dimensions: [
      { category: 'DOCUMENTATION', score: 100 },
      { category: 'TESTS', score: 100 },
      { category: 'ACCESSIBILITY', score: 100 },
      { category: 'ORGANIZATION', score: 100 },
      { category: 'MAINTAINABILITY', score: 100 },
    ],
    findings: [],
    insight: {
      category: 'DOCUMENTATION',
      title: 'Nenhum risco identificado',
      message: 'Mantenha as boas práticas do projeto.',
    },
  };

  const failedResult: FailedAnalysisResult = {
    projectId,
    status: 'FAILED',
    analyzedAt: '2026-09-28T12:00:00.000Z',
    demoMode: false,
    score: null,
    dimensions: [],
    findings: [],
    insight: null,
    error: {
      code: 'ANALYSIS_FAILED',
      message:
        'Não foi possível concluir a análise. Tente novamente mais tarde.',
    },
  };

  beforeEach(async () => {
    analyze.mockReset();

    const module = await Test.createTestingModule({
      controllers: [ProjectAnalysisController],
      providers: [
        {
          provide: ProjectAnalysisService,
          useValue: { analyze },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('retorna 200 com o resultado completo', async () => {
    analyze.mockResolvedValue(completedResult);

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/analyze`)
      .expect(200)
      .expect(completedResult);

    expect(analyze).toHaveBeenCalledExactlyOnceWith(projectId);
  });

  it('retorna 400 para ID inválido sem chamar o serviço', async () => {
    await request(app.getHttpServer())
      .post('/projects/id-invalido/analyze')
      .expect(400);

    expect(analyze).not.toHaveBeenCalled();
  });

  it('retorna 404 para projeto inexistente', async () => {
    analyze.mockRejectedValue(
      new NotFoundException('Projeto não encontrado.'),
    );

    const response = await request(app.getHttpServer())
      .post(`/projects/${projectId}/analyze`)
      .expect(404);

    expect(response.body.message).toBe('Projeto não encontrado.');
  });

  it('retorna 404 com FAILED para repositório inexistente', async () => {
    const result: FailedAnalysisResult = {
      ...failedResult,
      error: {
        code: 'REPOSITORY_NOT_FOUND',
        message:
          'Não foi possível encontrar o repositório público informado.',
      },
    };

    analyze.mockResolvedValue(result);

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/analyze`)
      .expect(404)
      .expect(result);
  });

  it('retorna 500 preservando o corpo seguro de FAILED', async () => {
    analyze.mockResolvedValue(failedResult);

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/analyze`)
      .expect(500)
      .expect(failedResult);
  });
});