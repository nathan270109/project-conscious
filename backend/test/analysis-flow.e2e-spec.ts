import { NotFoundException, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { GithubService } from '../src/github/github.service.js';
import { AccessibilityAnalyzer } from '../src/analysis/analyzers/accessibility.analyzer.js';

describe('Análise integrada pelo AppModule', () => {
  let app: INestApplication;
  const getRepositoryFiles = vi.fn<GithubService['getRepositoryFiles']>();
  const repositoryUrl = 'https://github.com/octocat/Hello-World';
  beforeEach(async () => {
    getRepositoryFiles.mockReset();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GithubService)
      .useValue({ getRepositoryFiles })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });
  async function createProject(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Projeto de integração', repositoryUrl })
      .expect(201);
    return response.body.id;
  }

  it('cadastra e analisa com os cinco analisadores e serviços reais', async () => {
    getRepositoryFiles.mockResolvedValue([
      { path: 'BadName.html', content: '<img src="logo.png">' },
      { path: 'src/main.ts', content: 'console.log("hello");' },
    ]);
    const id = await createProject();
    const { body } = await request(app.getHttpServer())
      .post(`/projects/${id}/analyze`)
      .expect(200);
    expect(body).toMatchObject({
      projectId: id,
      status: 'COMPLETED',
      demoMode: false,
      score: 83,
    });
    expect(new Date(body.analyzedAt).toISOString()).toBe(body.analyzedAt);
    expect(body.dimensions).toEqual([
      { category: 'DOCUMENTATION', score: 75 },
      { category: 'TESTS', score: 75 },
      { category: 'ACCESSIBILITY', score: 75 },
      { category: 'ORGANIZATION', score: 95 },
      { category: 'MAINTAINABILITY', score: 95 },
    ]);
    expect(body.findings.map((f: { category: string }) => f.category)).toEqual([
      'ACCESSIBILITY',
      'DOCUMENTATION',
      'TESTS',
      'MAINTAINABILITY',
      'ORGANIZATION',
    ]);
    expect(body.insight.category).toBe(body.findings[0].category);
    expect(body.insight.message).toContain(body.findings[0].message);
    expect(body.error).toBeUndefined();
    expect(getRepositoryFiles).toHaveBeenCalledExactlyOnceWith(repositoryUrl);
  });

  it('recusa UUID inválido e projeto inexistente antes de acessar o GitHub', async () => {
    await request(app.getHttpServer())
      .post('/projects/invalido/analyze')
      .expect(400);
    await request(app.getHttpServer())
      .post('/projects/a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad/analyze')
      .expect(404);
    expect(getRepositoryFiles).not.toHaveBeenCalled();
  });

  it('preserva validação do cadastro', async () => {
    await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'x', repositoryUrl: 'invalid' })
      .expect(400);
    expect(getRepositoryFiles).not.toHaveBeenCalled();
  });

  it.each([
    [new NotFoundException('Detalhe secreto'), 404, 'REPOSITORY_NOT_FOUND'],
    [new Error('Detalhe secreto'), 500, 'ANALYSIS_FAILED'],
  ])(
    'devolve FAILED seguro em falha externa: %s',
    async (error, status, code) => {
      getRepositoryFiles.mockRejectedValue(error);
      const id = await createProject();
      const { body } = await request(app.getHttpServer())
        .post(`/projects/${id}/analyze`)
        .expect(status);
      expect(body).toMatchObject({
        projectId: id,
        status: 'FAILED',
        score: null,
        dimensions: [],
        findings: [],
        insight: null,
        error: { code },
      });
      expect(JSON.stringify(body)).not.toContain('Detalhe secreto');
      expect(body.stack).toBeUndefined();
    },
  );

  it('não devolve COMPLETED quando um analisador real falha', async () => {
    getRepositoryFiles.mockResolvedValue([]);
    vi.spyOn(app.get(AccessibilityAnalyzer), 'analyze').mockImplementation(
      () => {
        throw new Error('Falha interna secreta');
      },
    );
    const id = await createProject();
    const { body } = await request(app.getHttpServer())
      .post(`/projects/${id}/analyze`)
      .expect(500);
    expect(body).toMatchObject({
      status: 'FAILED',
      score: null,
      dimensions: [],
      findings: [],
      insight: null,
      error: { code: 'ANALYSIS_FAILED' },
    });
    expect(JSON.stringify(body)).not.toContain('secreta');
  });
});
