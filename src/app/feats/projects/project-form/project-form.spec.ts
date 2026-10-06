import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectForm } from './project-form';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
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

  it('cadastra, preserva metadados e abre scanning sem iniciar análise', async () => {
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
    create.flush({ id, name: 'Projeto teste', repositoryUrl: 'https://github.com/octocat/Hello-World', createdAt: '2026-10-05T12:00:00.000Z' });
    http.expectNone('/api/projects/' + id + '/analyze');
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/projects', id, 'scanning']);
    expect(component.busy()).toBe(false);
    expect(TestBed.inject(AnalysisService).getProjectById(id)?.name).toBe('Projeto teste');
  });

  it('não navega quando o cadastro devolve dados incompletos', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await submit();
    http.expectOne('/api/projects').flush({ id });
    http.expectNone('/api/projects/' + id + '/analyze');
    await fixture.whenStable();
    expect(navigate).not.toHaveBeenCalled();
    expect(component.errorMessage()).not.toBe('');
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

  it.each([
    { name: '   ' }, { name: 'x'.repeat(101) }, { description: 'x'.repeat(2001) },
    { repositoryUrl: 'https://github.com:443/octocat/Hello-World' },
    { repositoryUrl: 'https://github.com/octocat/Hello-World?' },
  ])('aplica regras normalizadas antes de enviar à API: %j', patch => {
    component.project = { name: 'Projeto teste', repositoryUrl: 'https://github.com/octocat/Hello-World', ...patch };
    component.onSubmit({ invalid: false } as NgForm);
    expect(component.errorMessage()).not.toBe('');
    expect(component.busy()).toBe(false);
    http.expectNone(() => true);
  });

  it('oferece demo independente do cadastro e sem requisições', () => {
    const link = fixture.nativeElement.querySelector('a');
    expect(link.textContent).toContain('Abrir demonstração salva');
    expect(link.getAttribute('href')).toBe('/projects/' + component.demoProjectId + '/dashboard');
    http.expectNone(() => true);
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
