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

  constructor() {
    this.orderFindingsBySeverity();
  }

  private orderFindingsBySeverity(): void {
    if (!this.result) {
      return;
    }

    const severityOrder: Record<string, number> = {
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3
    };

    this.result = {
      ...this.result,
      findings: [...this.result.findings].sort(
        (a, b) =>
          severityOrder[a.severity] - severityOrder[b.severity]
      )
    };
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      HIGH: 'Alta',
      MEDIUM: 'Média',
      LOW: 'Baixa'
    };

    return labels[severity] ?? severity;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      DOCUMENTATION: 'Documentação',
      TESTS: 'Testes',
      ACCESSIBILITY: 'Acessibilidade',
      ORGANIZATION: 'Organização',
      MAINTAINABILITY: 'Manutenibilidade'
    };

    return labels[category] ?? category;
  }

}