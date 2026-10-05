import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectForm } from './project-form';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { createAnalysisFixture } from '../../../core/testing/analysis.fixture';
import { AnalysisService } from '../../../core/services/analysis.service';

describe('ProjectForm', () => {
  let component: ProjectForm;
  let fixture: ComponentFixture<ProjectForm>;
  let http: HttpTestingController;
  const id = 'a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectForm);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  async function submit() {
    const element = fixture.nativeElement as HTMLElement;
    const name = element.querySelector<HTMLInputElement>('#project-name')!;
    const url = element.querySelector<HTMLInputElement>('#repository-url')!;
    name.value = 'Projeto teste';
    url.value = 'https://github.com/octocat/Hello-World';
    name.dispatchEvent(new Event('input'));
    url.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const form = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
    expect(form.valid).toBe(true);
    component.onSubmit(form);
    return form;
  }

  it('cadastra, usa o UUID real, evita envio duplicado e abre o dashboard', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const form = await submit();
    component.onSubmit(form);
    const create = http.expectOne('/api/projects');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({
      name: 'Projeto teste',
      repositoryUrl: 'https://github.com/octocat/Hello-World',
    });
    expect(component.busy()).toBe(true);
    create.flush({ id });
    expect(component.progress()).toContain('Analisando');
    const result = { ...createAnalysisFixture(), projectId: id, demoMode: false };
    http.expectOne('/api/projects/' + id + '/analyze').flush(result);
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/projects', id, 'dashboard']);
    expect(component.busy()).toBe(false);
    expect(TestBed.inject(AnalysisService).getByProjectId(id)).toEqual(result);
  });

  it('abre o dashboard também para o FAILED seguro do backend', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await submit();
    http.expectOne('/api/projects').flush({ id });
    http.expectOne('/api/projects/' + id + '/analyze').flush(
      {
        projectId: id,
        analyzedAt: '2026-10-02T12:00:00.000Z',
        status: 'FAILED',
        score: null,
        dimensions: [],
        findings: [],
        insight: null,
        error: { code: 'REPOSITORY_NOT_FOUND', message: 'Repositório não encontrado.' },
      },
      { status: 404, statusText: 'Not Found' },
    );
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith(['/projects', id, 'dashboard']);
    expect(component.errorMessage()).toBe('');
  });

  it('mostra falha de rede sem apresentar sucesso nem iniciar análise', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await submit();
    http.expectOne('/api/projects').error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(component.busy()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'acessar a API',
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('não envia formulário inválido', () => {
    const form = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
    component.onSubmit(form);
    http.expectNone('/api/projects');
    expect(component.busy()).toBe(false);
  });

  it('cancela a solicitação quando a tela é destruída', async () => {
    await submit();
    const pending = http.expectOne('/api/projects');
    fixture.destroy();
    expect(pending.cancelled).toBe(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
