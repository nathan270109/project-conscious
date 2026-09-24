import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalysisResult } from '../../../core/models/analysis-result.model';
import { AnalysisService } from '../../../core/services/analysis.service';

@Component({
  imports: [],
  selector: 'app-project-dashboard',
  styleUrl: './project-dashboard.css',
  templateUrl: './project-dashboard.html',
})
export class ProjectDashboard {

  private readonly route = inject(ActivatedRoute);
  private readonly analysisService = inject(AnalysisService);

  projectId = this.route.snapshot.paramMap.get('id') ?? '';

  result: AnalysisResult | undefined =
    this.analysisService.getByProjectId(this.projectId);

}