import {
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYSIS_ENGINE } from '../analysis/analysis-engine.interface.js';
import type {
  AnalysisEngine,
  AnalysisEngineOutput,
} from '../analysis/analysis-engine.interface.js';
import { ProjectAnalysisService } from './project-analysis.service.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectAnalysisService', () => {
  let service: ProjectAnalysisService;

  const getProjectFiles =
    vi.fn<ProjectsService['getProjectFiles']>();
  const analyze = vi.fn<AnalysisEngine['analyze']>();

  const projectId = 'a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad';
  const files = [
    { path: 'README.md', content: '# Projeto de teste' },
  ];

  const engineResult: AnalysisEngineOutput = {
    score: 95,
    dimensions: [
      { category: 'DOCUMENTATION', score: 75 },
      { category: 'TESTS', score: 100 },
      { category: 'ACCESSIBILITY', score: 100 },
      { category: 'ORGANIZATION', score: 100 },
      { category: 'MAINTAINABILITY', score: 100 },
    ],
    findings: [
      {
        category: 'DOCUMENTATION',
        severity: 'HIGH',
        message: 'README sem instruções de instalação.',
        file: 'README.md',
        line: null,
      },
    ],
    insight: {
      category: 'DOCUMENTATION',
      title: 'Complete a documentação',
      message: 'Adicione instruções de instalação ao README.',
    },
  };

  beforeEach(async () => {
    getProjectFiles.mockReset();
    analyze.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        ProjectAnalysisService,
        {
          provide: ProjectsService,
          useValue: { getProjectFiles },
        },
        {
          provide: ANALYSIS_ENGINE,
          useValue: { analyze },
        },
      ],
    }).compile();

    service = module.get(ProjectAnalysisService);
  });

  it('analisa os arquivos do projeto e monta o resultado', async () => {
    getProjectFiles.mockResolvedValue(files);
    analyze.mockResolvedValue(engineResult);

    const startedAt = Date.now();
    const result = await service.analyze(projectId);
    const finishedAt = Date.now();

    expect(getProjectFiles).toHaveBeenCalledExactlyOnceWith(projectId);
    expect(analyze).toHaveBeenCalledExactlyOnceWith(files);

    expect(result).toEqual({
      ...engineResult,
      projectId,
      status: 'COMPLETED',
      analyzedAt: expect.any(String),
      demoMode: false,
    });

    const timestamp = Date.parse(result.analyzedAt);
    expect(timestamp).toBeGreaterThanOrEqual(startedAt);
    expect(timestamp).toBeLessThanOrEqual(finishedAt);
    expect(new Date(timestamp).toISOString()).toBe(result.analyzedAt);
  });

  it('preserva o erro de projeto inexistente sem chamar o motor', async () => {
    const error = new NotFoundException('Projeto não encontrado.');
    getProjectFiles.mockRejectedValue(error);

    await expect(service.analyze(projectId)).rejects.toBe(error);

    expect(analyze).not.toHaveBeenCalled();
  });

  it('preserva a falha do GitHub sem chamar o motor', async () => {
    const error = new ServiceUnavailableException(
      'GitHub indisponível.',
    );
    getProjectFiles.mockRejectedValue(error);

    await expect(service.analyze(projectId)).rejects.toBe(error);

    expect(analyze).not.toHaveBeenCalled();
  });

  it('propaga falha do motor sem devolver resultado concluído', async () => {
    getProjectFiles.mockResolvedValue(files);
    const error = new Error('Falha interna do motor.');
    analyze.mockRejectedValue(error);

    await expect(service.analyze(projectId)).rejects.toBe(error);
  });
});
