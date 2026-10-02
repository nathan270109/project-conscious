import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { AnalysisResult } from '../../../core/models/analysis-result.model';
import { AnalysisService } from '../../../core/services/analysis.service';

@Component({
  imports: [RouterLink],
  selector: 'app-project-dashboard',
  styleUrl: './project-dashboard.css',
  templateUrl: './project-dashboard.html',
})
export class ProjectDashboard {

  private readonly route = inject(ActivatedRoute);
  private readonly analysisService = inject(AnalysisService);

  projectId = this.route.snapshot.paramMap.get('id') ?? '';

  loading = true;
  errorMessage = '';
  result: AnalysisResult | undefined;

  constructor() {
    this.loadAnalysis();
  }

  private loadAnalysis(): void {
    try {
      this.result = this.analysisService.getByProjectId(this.projectId);

      // A fonte fornece a ordem de prioridade; o dashboard não recalcula riscos.
    } catch {
      this.errorMessage = 'Não foi possível carregar a análise.';
    } finally {
      this.loading = false;
    }
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      CRITICAL: 'Crítica',
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
