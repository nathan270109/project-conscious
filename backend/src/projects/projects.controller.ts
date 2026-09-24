import { Body, Controller, Post, Get, Param} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectsService } from './projects.service.js';
import { RepositoryFile } from '../github/github.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto): unknown {
    return this.projectsService.create(createProjectDto);
  }

    @Get(':id/files')
  getFiles(@Param('id') id: string): Promise<RepositoryFile[]> {
    return this.projectsService.getProjectFiles(id);
  }
}