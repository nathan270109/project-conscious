import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { GithubService } from './github.service.js';

type GithubRepositoriesClient = {
  get: (...args: unknown[]) => Promise<unknown>;
};

type GithubServiceForTest = {
  octokit: {
    rest: {
      repos: GithubRepositoriesClient;
    };
  };
};

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubService],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a URL outside the GitHub format', () => {
    expect(() => service.parseRepositoryUrl('https://google.com')).toThrow(
      BadRequestException,
    );
  });

  it('returns NotFoundException when the repository does not exist', async () => {
    const octokit = (service as unknown as GithubServiceForTest).octokit;

    vi.spyOn(octokit.rest.repos, 'get').mockRejectedValue({
      status: 404,
    });

    await expect(
      service.getRepositoryFiles('https://github.com/octocat/not-found'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([401, 403, 429])(
    'returns ServiceUnavailableException for GitHub status %i',
    async (status) => {
      const octokit = (service as unknown as GithubServiceForTest).octokit;

      vi.spyOn(octokit.rest.repos, 'get').mockRejectedValue({
        status,
      });

      await expect(
        service.getRepositoryFiles('https://github.com/octocat/demo'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    },
  );

  it('returns ServiceUnavailableException when the network fails', async () => {
    const octokit = (service as unknown as GithubServiceForTest).octokit;

    vi.spyOn(octokit.rest.repos, 'get').mockRejectedValue(
      new Error('Network unavailable'),
    );

    await expect(
      service.getRepositoryFiles('https://github.com/octocat/demo'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});