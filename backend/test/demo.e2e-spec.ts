import { Test } from '@nestjs/testing';
import { ServiceUnavailableException, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { GithubService } from '../src/github/github.service.js';
import saved from '../src/demo-data/analysis-result.json' with { type: 'json' };

describe('Modo demonstração com GitHub indisponível', () => {
  let app: INestApplication;
  const getRepositoryFiles = vi.fn().mockRejectedValue(new ServiceUnavailableException());

  beforeEach(async () => {
    getRepositoryFiles.mockClear();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GithubService).useValue({ getRepositoryFiles }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
  afterEach(async () => { await app.close(); });

  it('GET /demo/analysis retorna o JSON sem chamar GitHub nem cadastrar projeto', async () => {
    await request(app.getHttpServer()).get('/demo/analysis').expect(200).expect(saved);
    expect(getRepositoryFiles).not.toHaveBeenCalled();
  });

  it('mantém FAILED no projeto real; demo continua disponível somente por escolha explícita', async () => {
    const created = await request(app.getHttpServer()).post('/projects').send({
      name: 'Projeto real', repositoryUrl: 'https://github.com/octocat/Hello-World',
    }).expect(201);
    const failed = await request(app.getHttpServer())
      .post('/projects/' + created.body.id + '/analyze').expect(500);
    expect(failed.body.status).toBe('FAILED');
    expect(failed.body.demoMode).toBe(false);
    expect(failed.body.projectId).toBe(created.body.id);
    expect(getRepositoryFiles).toHaveBeenCalledTimes(1);
    await request(app.getHttpServer()).get('/demo/analysis').expect(200).expect(saved);
    expect(getRepositoryFiles).toHaveBeenCalledTimes(1);
  });
});
