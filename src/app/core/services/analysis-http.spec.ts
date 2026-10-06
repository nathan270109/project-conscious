import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { AnalysisService } from './analysis.service';
import { createAnalysisFixture } from '../testing/analysis.fixture';

describe('AnalysisService — HTTP', () => {
  let service: AnalysisService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AnalysisService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('não oferece mock para ID 1 ou para recarregamento sem cache', () => {
    expect(service.getByProjectId('1')).toBeUndefined();
  });

  it('preserva metadados da API e protege o cache contra alterações dos consumidores', () => {
    const project = { id: 'a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad', name: 'Projeto',
      repositoryUrl: 'https://github.com/octocat/Hello-World', createdAt: '2026-10-05T12:00:00.000Z' };
    service.createProject({ name: project.name, repositoryUrl: project.repositoryUrl })
      .subscribe(value => { value.name = 'Alterado'; });
    http.expectOne('/api/projects').flush(project);
    const copy = service.getProjectById(project.id)!;
    expect(copy).toEqual(project);
    copy.name = 'Outra alteração';
    expect(service.getProjectById(project.id)).toEqual(project);
    expect(service.getProjectById('ausente')).toBeUndefined();
  });

  it.each([404, 500])('preserva FAILED recebido com HTTP %i', (status) => {
    const result = {
      projectId: 'id',
      analyzedAt: '2026-10-02T12:00:00.000Z',
      status: 'FAILED',
      score: null,
      dimensions: [],
      findings: [],
      insight: null,
      error: { code: 'ANALYSIS_FAILED', message: 'Não foi possível analisar.' },
    };
    const next = vi.fn();
    service.analyze('id').subscribe(next);
    const req = http.expectOne('/api/projects/id/analyze');
    expect(req.request.method).toBe('POST');
    req.flush(result, { status, statusText: 'Failure' });
    expect(next).toHaveBeenCalledWith(result);
    expect(service.getByProjectId('id')).toEqual(result);
  });

  it('não confunde o 404 padrão do Nest com resultado FAILED', () => {
    const error = vi.fn();
    service.analyze('id').subscribe({ error });
    http
      .expectOne('/api/projects/id/analyze')
      .flush({ message: 'Projeto não encontrado.' }, { status: 404, statusText: 'Not Found' });
    expect(error).toHaveBeenCalledOnce();
    expect(service.getByProjectId('id')).toBeUndefined();
  });

  it.each([
    null,
    { ...createAnalysisFixture(), projectId: 'outro' },
    { ...createAnalysisFixture(), score: 101 },
    { ...createAnalysisFixture(), dimensions: [] },
    { ...createAnalysisFixture(), insight: 'texto antigo' },
    { ...createAnalysisFixture(), findings: [{ category: 'TESTS' }] },
  ])('rejeita resposta incompatível sem colocar no cache', (result) => {
    const error = vi.fn();
    service.analyze('1').subscribe({ error });
    http.expectOne('/api/projects/1/analyze').flush(result);
    expect(error).toHaveBeenCalledOnce();
    expect(service.getByProjectId('1')).toBeUndefined();
  });

  it('limita a espera e cancela a requisição HTTP', () => {
    vi.useFakeTimers();
    const error = vi.fn();
    service.analyze('1').subscribe({ error });
    const request = http.expectOne('/api/projects/1/analyze');
    vi.advanceTimersByTime(60001);
    expect(error).toHaveBeenCalledOnce();
    expect(request.cancelled).toBe(true);
  });
});
