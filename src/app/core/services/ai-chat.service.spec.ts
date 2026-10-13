import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AiChatService, type AiAnalysisContext } from './ai-chat.service';

describe('AiChatService', () => {
  let service: AiChatService;
  let http: HttpTestingController;

  const analysis: AiAnalysisContext = {
    projectName: 'Project Conscious',
    analysisDate: '2026-10-11T00:00:00.000Z',
    score: 80,
    dimensions: [{ name: 'Documentação', score: 70 }],
    findings: [{
      severity: 'HIGH',
      category: 'Documentação',
      title: 'README incompleto',
      problem: 'README incompleto',
      whyItMatters: 'Onboarding não é reproduzível.',
      remediation: 'Documente os comandos reais.',
      evidence: null,
      occurrences: 1,
      file: 'README.md',
      line: null,
    }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AiChatService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AiChatService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('usa a rota relativa do CloudFront e limita o histórico enviado', () => {
    const history = Array.from({ length: 8 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' as const : 'assistant' as const,
      content: `mensagem ${index}`,
    }));
    let answer = '';

    service.ask('  Onde está o risco?  ', analysis, history).subscribe((response) => {
      answer = response.answer;
    });

    const request = http.expectOne('/api/ai/chat');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.question).toBe('Onde está o risco?');
    expect(request.request.body.history).toHaveLength(6);
    request.flush({ answer: '  No README.  ', model: 'google.gemma-4-e2b' });
    expect(answer).toBe('No README.');
  });

  it('rejeita uma resposta vazia do modelo', () => {
    let failed = false;
    service.ask('Pergunta', analysis).subscribe({ error: () => (failed = true) });
    http.expectOne('/api/ai/chat').flush({ answer: ' ', model: 'google.gemma-4-e2b' });
    expect(failed).toBe(true);
  });

  it('repete uma vez quando a API falha temporariamente', () => {
    vi.useFakeTimers();
    let answer = '';

    service.ask('Pergunta', analysis).subscribe((response) => (answer = response.answer));
    http.expectOne('/api/ai/chat').flush(
      { error: 'Falha temporária.' },
      { status: 502, statusText: 'Bad Gateway' },
    );

    vi.advanceTimersByTime(800);
    http.expectOne('/api/ai/chat').flush({
      answer: 'Resposta recuperada.',
      model: 'google.gemma-4-e2b',
    });

    expect(answer).toBe('Resposta recuperada.');
    vi.useRealTimers();
  });

  it('preserva a mensagem retornada pela API em erro não transitório', () => {
    let message = '';
    service.ask('Pergunta', analysis).subscribe({
      error: (error: Error) => (message = error.message),
    });

    http.expectOne('/api/ai/chat').flush(
      { error: 'Escreva uma pergunta válida.' },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(message).toBe('Escreva uma pergunta válida.');
  });
});
