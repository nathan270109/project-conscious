import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { AnalysisResult, Finding, Project } from '../../../core/models/analysis-result.model';
import { AnalysisService } from '../../../core/services/analysis.service';
import { DEMO_PROJECT_ID, DEMO_REPOSITORY_URL } from '../../../core/models/demo-analysis';
import {
  AiChatService,
  type AiAnalysisContext,
  type AiChatMessage,
} from '../../../core/services/ai-chat.service';

@Component({
  imports: [RouterLink],
  selector: 'app-project-dashboard',
  styleUrl: './project-dashboard.design.css',
  templateUrl: './project-dashboard.html',
})
export class ProjectDashboard {
  @ViewChild('chatDialog') private chatDialog?: ElementRef<HTMLDialogElement>;

  readonly demoProjectId = DEMO_PROJECT_ID;
  readonly demoRepositoryUrl = DEMO_REPOSITORY_URL;
  readonly suggestedQuestions = [
    'Onde está o maior risco deste projeto?',
    'Quais arquivos merecem atenção primeiro?',
    'Explique este projeto para um novo desenvolvedor.',
  ];

  private readonly route = inject(ActivatedRoute);
  private readonly analysisService = inject(AnalysisService);
  private readonly aiChatService = inject(AiChatService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  projectId = this.route.snapshot.paramMap.get('id') ?? '';
  project: Project | undefined;

  loading = true;
  errorMessage = '';
  result: AnalysisResult | undefined;
  chatQuestion = '';
  chatLoading = false;
  chatError = '';
  chatMessages: AiChatMessage[] = [];
  explainingFindingIndex: number | null = null;
  findingExplanations: Record<number, string> = {};

  constructor() {
    this.loadAnalysis();
  }

  private loadAnalysis(): void {
    try {
      this.result = this.analysisService.getByProjectId(this.projectId);
      this.project = this.analysisService.getProjectById(this.projectId);

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

  openChat(): void {
    this.chatError = '';
    this.chatDialog?.nativeElement.showModal();
  }

  closeChat(): void {
    this.chatDialog?.nativeElement.close();
  }

  updateChatQuestion(event: Event): void {
    this.chatQuestion = (event.target as HTMLTextAreaElement).value;
  }

  handleChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendQuestion();
    }
  }

  sendQuestion(question = this.chatQuestion): void {
    const cleanQuestion = question.trim();
    const analysis = this.buildAiContext();
    if (!cleanQuestion || !analysis || this.chatLoading) return;

    const history = this.chatMessages.slice(-6);
    this.chatMessages = [...this.chatMessages, { role: 'user', content: cleanQuestion }];
    this.chatQuestion = '';
    this.chatError = '';
    this.chatLoading = true;

    this.aiChatService.ask(cleanQuestion, analysis, history).subscribe({
      next: ({ answer }) => {
        this.chatMessages = [...this.chatMessages, { role: 'assistant', content: answer }];
        this.chatLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.chatError =
          error instanceof Error
            ? error.message
            : 'Não foi possível consultar a IA agora. Tente novamente em instantes.';
        this.chatLoading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  explainFinding(finding: Finding, index: number): void {
    const analysis = this.buildAiContext();
    if (!analysis || this.explainingFindingIndex !== null) return;

    this.explainingFindingIndex = index;
    const location = finding.line === null ? finding.file : `${finding.file}:${finding.line}`;
    const question =
      `Explique em linguagem simples o problema "${finding.title}": ${finding.message} Em ${location}. ` +
      `Impacto identificado: ${finding.whyItMatters} Correção sugerida: ${finding.remediation} ` +
      'Descreva o impacto prático, a prioridade e um próximo passo verificável sem inventar evidências.';

    this.aiChatService.ask(question, analysis).subscribe({
      next: ({ answer }) => {
        this.findingExplanations = { ...this.findingExplanations, [index]: answer };
        this.explainingFindingIndex = null;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.findingExplanations = {
          ...this.findingExplanations,
          [index]:
            error instanceof Error
              ? error.message
              : 'Não foi possível gerar a explicação agora. Tente novamente.',
        };
        this.explainingFindingIndex = null;
        this.changeDetector.markForCheck();
      },
    });
  }

  private buildAiContext(): AiAnalysisContext | undefined {
    if (!this.result || this.result.status !== 'COMPLETED') return undefined;

    return {
      projectName: this.project?.name ?? this.projectId,
      analysisDate: this.result.analyzedAt,
      score: this.result.score,
      dimensions: this.result.dimensions.map((dimension) => ({
        name: this.getCategoryLabel(dimension.category),
        score: dimension.score,
      })),
      findings: this.result.findings.map((finding) => ({
        severity: finding.severity,
        category: this.getCategoryLabel(finding.category),
        title: finding.title,
        problem: finding.message,
        whyItMatters: finding.whyItMatters,
        remediation: finding.remediation,
        evidence: finding.evidence,
        occurrences: finding.occurrences,
        file: finding.file,
        line: finding.line,
      })),
    };
  }
}
