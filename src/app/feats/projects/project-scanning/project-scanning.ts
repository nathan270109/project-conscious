import { Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, Subscription, TimeoutError } from 'rxjs';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { Project } from '../../../core/models/analysis-result.model';

@Component({
  selector: 'app-project-scanning',
  imports: [RouterLink],
  templateUrl: './project-scanning.html',
  styleUrl: './project-scanning.css',
})
export class ProjectScanning {
  private readonly service = inject(AnalysisService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private request?: Subscription;
  private generation = 0;
  readonly project = signal<Project | undefined>(undefined);
  readonly busy = signal(false);
  readonly errorMessage = signal('');
  readonly steps = ['Estrutura (preparação)', 'Documentação', 'Testes', 'Acessibilidade', 'Organização', 'Manutenibilidade'];

  constructor() {
    this.route.paramMap.pipe(map(params => params.get('id') ?? ''), distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)).subscribe(id => {
      this.generation++;
      this.request?.unsubscribe();
      this.busy.set(false);
      this.errorMessage.set('');
      this.project.set(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(id)
        ? this.service.getProjectById(id) : undefined);
      if (!this.project()) {
        this.errorMessage.set('Projeto não disponível nesta sessão. Se você atualizou a página ou abriu um link direto, faça um novo cadastro.');
        return;
      }
      this.start();
    });
  }

  start(): void {
    const project = this.project();
    if (!project || this.busy()) return;
    this.errorMessage.set('');
    const generation = this.generation;
    // Voltar à rota não inicia novamente uma análise que já terminou.
    if (this.service.getByProjectId(project.id)) {
      this.openDashboard(project.id, generation);
      return;
    }
    this.busy.set(true);
    this.request = this.service.analyze(project.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.openDashboard(project.id, generation),
        error: (error: unknown) => {
          this.busy.set(false);
          this.errorMessage.set(error instanceof TimeoutError
            ? 'A análise demorou mais que o esperado. Uma nova tentativa pode repetir o processamento no servidor.'
            : error instanceof HttpErrorResponse && error.status === 0
              ? 'Não foi possível acessar a API. Verifique a conexão e tente novamente.'
              : error instanceof HttpErrorResponse && error.status === 404
                ? 'Projeto não encontrado na API. O servidor pode ter reiniciado; faça um novo cadastro.'
                : 'Não foi possível obter um resultado válido. Tente novamente ou volte ao cadastro.');
        },
      });
  }

  private openDashboard(id: string, generation: number): void {
    if (this.destroyRef.destroyed || generation !== this.generation) return;
    this.busy.set(true);
    const failedNavigation = () => {
      if (this.destroyRef.destroyed || generation !== this.generation) return;
      this.busy.set(false);
      this.errorMessage.set('A análise está salva nesta sessão, mas não foi possível abrir o dashboard. Tente novamente.');
    };
    void this.router.navigate(['/projects', id, 'dashboard'])
      .then(navigated => { if (!navigated) failedNavigation(); })
      .catch(failedNavigation);
  }
}
