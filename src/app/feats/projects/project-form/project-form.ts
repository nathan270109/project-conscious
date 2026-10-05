import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, TimeoutError } from 'rxjs';
import { AnalysisService } from '../../../core/services/analysis.service';
import type { ProjectDraft } from '../../../core/models/analysis-result.model';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-project-form',
  styleUrl: './project-form.css',
  templateUrl: './project-form.html',
})
export class ProjectForm {
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
    let validRepository = false;
    try {
      const url = new URL(draft.repositoryUrl);
      validRepository =
        url.protocol === 'https:' &&
        url.hostname === 'github.com' &&
        /^\/[^/]+\/[^/]+\/?$/.test(url.pathname) &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash;
    } catch {
      /* URLs malformadas também são rejeitadas abaixo. */
    }
    if (draft.name.length < 3 || !validRepository) {
      this.errorMessage.set(
        'Informe um nome com ao menos três caracteres e uma URL https://github.com/usuario/repositorio.',
      );
      return;
    }
    this.busy.set(true);
    this.errorMessage.set('');
    this.progress.set('Cadastrando projeto…');
    this.analysis
      .createProject(draft)
      .pipe(
        switchMap((project) => {
          this.progress.set('Analisando o repositório… Aguarde.');
          return this.analysis.analyze(project.id);
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (result) => {
          void this.router
            .navigate(['/projects', result.projectId, 'dashboard'])
            .then((navigated) => {
              if (!navigated)
                this.errorMessage.set('Não foi possível abrir o dashboard. Tente novamente.');
            })
            .catch(() =>
              this.errorMessage.set('Não foi possível abrir o dashboard. Tente novamente.'),
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
