import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DEMO_PROJECT_ID } from '../../../core/models/demo-analysis';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, TimeoutError } from 'rxjs';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { ProjectDraft } from '../../../core/models/analysis-result.model';
import { isGithubRepositoryUrl } from '../../../core/models/project-input.validation';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-project-form',
  styleUrl: './project-form.css',
  templateUrl: './project-form.html',
})
export class ProjectForm {
  readonly demoProjectId = DEMO_PROJECT_ID;
  private readonly analysis = inject(AnalysisService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly busy = signal(false);
  readonly progress = signal('');
  readonly errorMessage = signal('');
  project: ProjectDraft = {
    name: '',
    repositoryUrl: '',
    description: '',
  };

  submitted = false;

  // onSubmit: função que será chamada quando o formulário for enviado.
  onSubmit(form: NgForm): void {
    if (this.busy()) return;
    this.submitted = true;
    // submitted: informa se a pessoa tentou enviar o formulário.

    if (form.invalid) {
      return;
    }
    const draft: ProjectDraft = {
      name: this.project.name.trim(),
      repositoryUrl: this.project.repositoryUrl.trim(),
      ...(this.project.description?.trim() ? { description: this.project.description.trim() } : {}),
    };
    if (draft.name.length < 3 || draft.name.length > 100 ||
        (draft.description?.length ?? 0) > 2000 || !isGithubRepositoryUrl(draft.repositoryUrl)) {
      this.errorMessage.set(
        'Use nome de 3 a 100 caracteres, descrição de até 2000 e URL https://github.com/usuario/repositorio sem credenciais, porta, parâmetros ou fragmento.',
      );
      return;
    }
    this.busy.set(true);
    this.errorMessage.set('');
    this.progress.set('Cadastrando projeto…');
    this.analysis
      .createProject(draft)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (project) => {
          void this.router
            .navigate(['/projects', project.id, 'scanning'])
            .then((navigated) => {
              if (!navigated)
                this.errorMessage.set('Não foi possível abrir a tela de análise. Tente novamente.');
            })
            .catch(() =>
              this.errorMessage.set('Não foi possível abrir a tela de análise. Tente novamente.'),
            );
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof TimeoutError
              ? 'A solicitação demorou mais que o esperado. Tente novamente.'
              : error instanceof HttpErrorResponse && error.status === 0
                ? 'Não foi possível acessar a API. Verifique a conexão e se o backend está iniciado.'
                : error instanceof HttpErrorResponse && error.status === 400
                  ? 'O cadastro foi recusado. Confira o nome e a URL do repositório.'
                  : error instanceof HttpErrorResponse && error.status === 404
                    ? 'Projeto não encontrado. O backend pode ter reiniciado; cadastre novamente.'
                    : 'Não foi possível concluir a solicitação. Tente novamente.',
          );
        },
      });
  }
}
