import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateProjectDto } from './dto/create-project.dto.js';

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
}
