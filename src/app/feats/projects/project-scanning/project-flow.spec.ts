import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NgForm } from '@angular/forms';
import { ProjectForm } from '../project-form/project-form';
import { ProjectScanning } from './project-scanning';
import { ProjectDashboard } from '../project-dashboard/project-dashboard';
import { createAnalysisFixture } from '../../../core/testing/analysis.fixture';

describe('Fluxo roteado formulário → scanning → dashboard', () => {
  it('faz um cadastro e uma análise, preserva ID e exibe nome e resultado', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      provideRouter([
        { path: 'projects/new', component: ProjectForm },
        { path: 'projects/:id/scanning', component: ProjectScanning },
        { path: 'projects/:id/dashboard', component: ProjectDashboard },
      ]),
    ] });
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create();
    const form = await harness.navigateByUrl('/projects/new', ProjectForm);
    form.project = { name: 'Fluxo integrado', repositoryUrl: 'https://github.com/octocat/Hello-World' };
    form.onSubmit({ invalid: false } as NgForm);
    const project = { ...form.project, id: 'a5f68a91-2ff2-4928-a7b8-ef26e2bc37ad', createdAt: '2026-10-05T12:00:00.000Z' };
    http.expectOne('/api/projects').flush(project);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe('/projects/' + project.id + '/scanning');
    expect(harness.routeNativeElement?.textContent).toContain('Analisando Fluxo integrado');
    const result = { ...createAnalysisFixture(), projectId: project.id, demoMode: false };
    http.expectOne('/api/projects/' + project.id + '/analyze').flush(result);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe('/projects/' + project.id + '/dashboard');
    expect(harness.routeNativeElement?.textContent).toContain('Fluxo integrado');
    expect(harness.routeNativeElement?.querySelectorAll('.dimension-card')).toHaveLength(5);
    expect(harness.routeNativeElement?.querySelector('.dashboard__score')?.textContent).toContain('80/100');
    http.verify();
  });
});
