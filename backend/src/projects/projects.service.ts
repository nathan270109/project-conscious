import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { GithubService, RepositoryFile } from '../github/github.service.js';

interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  description?: string;
  createdAt: string;
}

@Injectable()
export class ProjectsService {
    private readonly projects: Project[] = [];

    constructor(private readonly githubService: GithubService) {}

  create(createProjectDto: CreateProjectDto): Project {
    const project: Project = {
      id: randomUUID(),
      name: createProjectDto.name,
      repositoryUrl: createProjectDto.repositoryUrl,
      description: createProjectDto.description,
      createdAt: new Date().toISOString(),
    };

    this.projects.push(project);

    return project;
  }

  findById(id: string): Project {
  const project = this.projects.find((item) => item.id === id);

  if (!project) {
    throw new NotFoundException('Projeto não encontrado.');
  }

  return project;
}

   async getProjectFiles(id: string): Promise<RepositoryFile[]> {
    const project = this.findById(id);

    return this.githubService.getRepositoryFiles(project.repositoryUrl);
  }
}
