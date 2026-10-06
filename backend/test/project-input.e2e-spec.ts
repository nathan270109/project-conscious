import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { vi } from 'vitest';
import { ProjectsController } from '../src/projects/projects.controller.js';
import { ProjectsService } from '../src/projects/projects.service.js';
import { GithubService } from '../src/github/github.service.js';

describe('POST /projects — validação antes do cadastro', () => {
  let app: INestApplication;
  const getRepositoryFiles = vi.fn();
  let create: ReturnType<typeof vi.spyOn>;
  const valid = { name: 'Projeto', repositoryUrl: 'https://github.com/octocat/Hello-World' };
  beforeEach(async () => {
    getRepositoryFiles.mockReset();
    const module = await Test.createTestingModule({ controllers: [ProjectsController], providers: [
      ProjectsService, { provide: GithubService, useValue: { getRepositoryFiles } },
    ] }).compile();
    create = vi.spyOn(module.get(ProjectsService), 'create');
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true,
      transform: true, validationError: { target: false, value: false } }));
    await app.init();
  });
  afterEach(async () => { vi.restoreAllMocks(); await app.close(); });

  it.each([
    { name: '   ' }, { name: ' ab ' }, { name: 'x'.repeat(101) }, { name: 123 },
    { description: 'x'.repeat(2001) }, { description: null }, { description: [] },
    { repositoryUrl: 'https://example.com/owner/repo' },
    { repositoryUrl: 'https://user:secret@github.com/owner/repo' },
    { repositoryUrl: 'https://github.com:443/owner/repo' },
    { repositoryUrl: 'https://github.com/owner/repo?tab=readme' },
    { repositoryUrl: 'https://github.com/owner/repo#readme' },
    { repositoryUrl: 'https://github.com/owner/repo/tree/main' },
    { repositoryUrl: null }, { unexpected: true },
  ])('retorna 400 sem criar projeto nem consultar GitHub: %j', async patch => {
    const response = await request(app.getHttpServer()).post('/projects').send({ ...valid, ...patch }).expect(400);
    expect(response.body.message).toBeInstanceOf(Array);
    expect(response.body).not.toHaveProperty('stack');
    expect(JSON.stringify(response.body)).not.toContain('user:secret');
    expect(create).not.toHaveBeenCalled();
    expect(getRepositoryFiles).not.toHaveBeenCalled();
  });

  it.each(['', '/', '.git', '.git/'])('cadastra URL válida com sufixo %s e preserva UUID/data', async suffix => {
    const { body } = await request(app.getHttpServer()).post('/projects').send({
      name: '  Projeto  ', repositoryUrl: ` ${valid.repositoryUrl}${suffix} `, description: '  Descrição  ',
    }).expect(201);
    expect(body).toMatchObject({ name: 'Projeto', repositoryUrl: valid.repositoryUrl + suffix, description: 'Descrição' });
    expect(body.id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
    expect(new Date(body.createdAt).toISOString()).toBe(body.createdAt);
    expect(create).toHaveBeenCalledOnce();
    expect(getRepositoryFiles).not.toHaveBeenCalled();
  });
});
