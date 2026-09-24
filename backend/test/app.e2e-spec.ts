import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { vi } from 'vitest';
import { AppModule } from './../src/app.module.js';
import { GithubService } from './../src/github/github.service.js';

describe('Projects routes (e2e)', () => {
  let app: INestApplication;

  const githubServiceMock = {
    getRepositoryFiles: vi.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GithubService)
      .useValue(githubServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await app.close();
  });

  it('creates a project and returns its filtered repository files', async () => {
    const expectedFiles = [
      {
        path: 'README.md',
        content: '# Projeto de teste',
      },
      {
        path: 'src/main.ts',
        content: 'console.log("Hello");',
      },
    ];

    githubServiceMock.getRepositoryFiles.mockResolvedValue(expectedFiles);

    const createResponse = await request(app.getHttpServer())
      .post('/projects')
      .send({
        name: 'Projeto para teste',
        repositoryUrl: 'https://github.com/octocat/Hello-World',
      })
      .expect(201);

    const projectId = createResponse.body.id;

    await request(app.getHttpServer())
      .get(`/projects/${projectId}/files`)
      .expect(200)
      .expect(expectedFiles);

    expect(githubServiceMock.getRepositoryFiles).toHaveBeenCalledWith(
      'https://github.com/octocat/Hello-World',
    );
  });

  it('returns 404 when the project id does not exist', async () => {
    await request(app.getHttpServer())
      .get('/projects/project-id-inexistente/files')
      .expect(404)
      .expect(({ body }) => {
        expect(body.message).toBe('Projeto não encontrado.');
      });
  });
});