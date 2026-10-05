import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, tap, throwError, timeout } from 'rxjs';
import type { AnalysisResult, Project, ProjectDraft } from '../models/analysis-result.model';
import { isAnalysisResult } from '../models/analysis-result.guard';
import { DEMO_PROJECT_ID, readDemoAnalysis } from '../models/demo-analysis';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private readonly http = inject(HttpClient);
  private readonly results = new Map<string, AnalysisResult>();

  createProject(draft: ProjectDraft) {
    return this.http.post<Project>('/api/projects', draft).pipe(
      timeout(60000),
      map((project) => {
        if (!project || typeof project.id !== 'string' || !project.id) {
          throw new Error('Resposta de cadastro inválida.');
        }
        return project;
      }),
    );
  }

  analyze(projectId: string) {
    this.results.delete(projectId);
    return this.http
      .post<unknown>(`/api/projects/${encodeURIComponent(projectId)}/analyze`, {})
      .pipe(
        timeout(60000),
        catchError((error: unknown) => {
          if (
            error instanceof HttpErrorResponse &&
            (error.status === 404 || error.status === 500) &&
            isAnalysisResult(error.error, projectId) &&
            error.error.status === 'FAILED'
          ) {
            return of(error.error);
          }
          return throwError(() => error);
        }),
        map((result) => {
          if (!isAnalysisResult(result, projectId))
            throw new Error('Resultado incompatível com o contrato.');
          return result;
        }),
        tap((result) => this.results.set(projectId, structuredClone(result))),
      );
  }

  getByProjectId(id: string): AnalysisResult | undefined {
    if (id === DEMO_PROJECT_ID) return this.getDemoAnalysis();
    const result = this.results.get(id);
    return result ? structuredClone(result) : undefined;
  }

  getDemoAnalysis() {
    return readDemoAnalysis();
  }
}
