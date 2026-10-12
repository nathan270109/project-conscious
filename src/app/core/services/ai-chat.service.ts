import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, retry, throwError, timeout, timer } from 'rxjs';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiAnalysisContext {
  projectName: string;
  analysisDate: string;
  score: number;
  dimensions: Array<{ name: string; score: number }>;
  findings: Array<{
    severity: string;
    category: string;
    problem: string;
    file: string;
    line: number | null;
  }>;
}

interface AiChatResponse {
  answer: string;
  model: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private readonly http = inject(HttpClient);

  ask(question: string, analysis: AiAnalysisContext, history: readonly AiChatMessage[] = []) {
    return this.http
      .post<AiChatResponse>('/api/ai/chat', {
        question: question.trim(),
        analysis,
        history: history.slice(-6),
      })
      .pipe(
        timeout({ first: 35_000 }),
        retry({
          count: 1,
          delay: (error) =>
            this.isTransientError(error) ? timer(800) : throwError(() => error),
        }),
        map((response) => {
          if (!response || typeof response.answer !== 'string' || !response.answer.trim()) {
            throw new Error('A IA retornou uma resposta inválida.');
          }

          return {
            answer: response.answer.trim(),
            model: response.model,
          };
        }),
        catchError((error) => throwError(() => new Error(this.errorMessage(error)))),
      );
  }

  private isTransientError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) return true;
    return error.status === 0 || error.status === 429 || error.status >= 500;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.error;
      if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage.trim();
      if (error.status === 404) {
        return 'O endpoint da IA não está disponível neste ambiente.';
      }
      if (error.status === 0) {
        return 'Não foi possível conectar à IA. Verifique a conexão e tente novamente.';
      }
    }

    return 'Não foi possível consultar a IA agora. Tente novamente em instantes.';
  }
}
