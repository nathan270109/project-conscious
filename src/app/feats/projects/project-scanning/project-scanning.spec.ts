import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { ProjectScanning } from './project-scanning';
import { AnalysisService } from '../../../core/services/analysis.service';
import { createAnalysisFixture } from '../../../core/testing/analysis.fixture';

describe('ProjectScanning — análise real', () => {
  const id = 'a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad';
  const project = { id, name: 'Projeto teste', repositoryUrl: 'https://github.com/octocat/Hello-World', createdAt: '2026-10-05T12:00:00.000Z' };
  let http: HttpTestingController;
  let service: AnalysisService;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id }));
    TestBed.configureTestingModule({ imports: [ProjectScanning], providers: [
      provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { paramMap: params } },
    ] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AnalysisService);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); vi.useRealTimers(); });

  function register() {
    service.createProject({ name: project.name, repositoryUrl: project.repositoryUrl }).subscribe();
    http.expectOne('/api/projects').flush(project);
  }
  function render() {
    const fixture = TestBed.createComponent(ProjectScanning);
    fixture.detectChanges();
    return fixture;
  }
  function completed() { return { ...createAnalysisFixture(), projectId: id, demoMode: false }; }

  it('aguarda uma única análise e guarda resultado antes da navegação', async () => {
    register();
    const fixture = render();
    fixture.componentInstance.start();
    expect(fixture.nativeElement.textContent).toContain('Projeto teste');
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('não indica o progresso');
    expect(navigate).not.toHaveBeenCalled();
    const request = http.expectOne('/api/projects/' + id + '/analyze');
    request.flush(completed());
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/projects', id, 'dashboard']);
    expect(service.getByProjectId(id)).toEqual(completed());
    http.expectNone('/api/projects');
  });

  it.each([404, 500])('abre dashboard de FAILED válido recebido em HTTP %i', async status => {
    register(); render();
    const result = { projectId: id, analyzedAt: project.createdAt, status: 'FAILED', score: null,
      dimensions: [], findings: [], insight: null, error: { code: 'ANALYSIS_FAILED', message: 'Falha segura.' } };
    http.expectOne('/api/projects/' + id + '/analyze').flush(result, { status, statusText: 'Failure' });
    await Promise.resolve();
    expect(navigate).toHaveBeenCalledWith(['/projects', id, 'dashboard']);
    expect(service.getByProjectId(id)).toEqual(result);
  });

  it.each(['invalido', id])('oferece recuperação sem chamar API quando não há projeto (%s)', routeId => {
    params.next(convertToParamMap({ id: routeId }));
    const fixture = render();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('não disponível');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/projects/new');
    http.expectNone(() => true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('permite repetir no mesmo ID após falha de transporte, sem novo cadastro', () => {
    register(); const fixture = render();
    http.expectOne('/api/projects/' + id + '/analyze').error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('acessar a API');
    expect(navigate).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('button').click();
    fixture.componentInstance.start();
    http.expectOne('/api/projects/' + id + '/analyze').flush(completed());
    http.expectNone('/api/projects');
  });

  it('rejeita resposta de outro ID sem navegar', () => {
    register(); const fixture = render();
    http.expectOne('/api/projects/' + id + '/analyze').flush({ ...completed(), projectId: 'outro' });
    expect(fixture.componentInstance.errorMessage()).toContain('resultado válido');
    expect(service.getByProjectId(id)).toBeUndefined();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('encerra espera após timeout sem progresso fictício', () => {
    vi.useFakeTimers(); register(); const fixture = render();
    const request = http.expectOne('/api/projects/' + id + '/analyze');
    vi.advanceTimersByTime(60001);
    expect(request.cancelled).toBe(true);
    expect(fixture.componentInstance.busy()).toBe(false);
    expect(fixture.componentInstance.errorMessage()).toContain('demorou');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('cancela assinatura ao sair, sem navegar', () => {
    register(); const fixture = render();
    const request = http.expectOne('/api/projects/' + id + '/analyze');
    fixture.destroy();
    expect(request.cancelled).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('cancela o projeto anterior quando o parâmetro muda', () => {
    register(); const fixture = render();
    const request = http.expectOne('/api/projects/' + id + '/analyze');
    params.next(convertToParamMap({ id: 'invalido' }));
    expect(request.cancelled).toBe(true);
    expect(fixture.componentInstance.project()).toBeUndefined();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('reabre resultado salvo sem repetir a análise se a navegação falhou', async () => {
    navigate.mockResolvedValue(false);
    register(); const fixture = render();
    http.expectOne('/api/projects/' + id + '/analyze').flush(completed());
    await fixture.whenStable();
    expect(fixture.componentInstance.errorMessage()).toContain('não foi possível abrir');
    navigate.mockResolvedValue(true);
    fixture.componentInstance.start();
    http.expectNone('/api/projects/' + id + '/analyze');
    expect(navigate).toHaveBeenCalledTimes(2);
  });
});
