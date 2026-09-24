import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { GithubService } from '../github/github.service.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const githubServiceMock = {
    getRepositoryFiles: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: GithubService,
          useValue: githubServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates and finds a project by id', () => {
    const project = service.create({
      name: 'Projeto de teste',
      repositoryUrl: 'https://github.com/octocat/Hello-World',
    });

    const foundProject = service.findById(project.id);

    expect(foundProject).toEqual(project);
  });

  it('gets files using the repository URL saved in the project', async () => {
    const expectedFiles = [
      {
        path: 'README.md',
        content: '# Projeto de teste',
      },
    ];

    githubServiceMock.getRepositoryFiles.mockResolvedValue(expectedFiles);

    const project = service.create({
      name: 'Projeto de teste',
      repositoryUrl: 'https://github.com/octocat/Hello-World',
    });

    await expect(service.getProjectFiles(project.id)).resolves.toEqual(
      expectedFiles,
    );

    expect(githubServiceMock.getRepositoryFiles).toHaveBeenCalledWith(
      'https://github.com/octocat/Hello-World',
    );
  });

  it('returns NotFoundException when the project does not exist', async () => {
    await expect(
      service.getProjectFiles('project-id-inexistente'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(githubServiceMock.getRepositoryFiles).not.toHaveBeenCalled();
  });
});