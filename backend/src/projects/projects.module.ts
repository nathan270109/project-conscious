import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { GithubModule } from '../github/github.module.js';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [GithubModule]
})
export class ProjectsModule {}
