import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AnalysisService } from './analysis.service';
import { DEMO_PROJECT_ID, DEMO_REPOSITORY_URL, DEMO_REVISION, readDemoAnalysis } from '../models/demo-analysis';
import { isAnalysisResult } from '../models/analysis-result.guard';
import { createAnalysisFixture } from '../testing/analysis.fixture';
import { ProjectDashboard } from '../../feats/projects/project-dashboard/project-dashboard';
import snapshot from '../../../../backend/src/demo-data/repository-snapshot.json';

describe('Demo offline e compatibilidade CONSCIOUS-47', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ProjectDashboard],
    providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
      { provide: ActivatedRoute, useValue: {
        snapshot: { paramMap: convertToParamMap({ id: DEMO_PROJECT_ID }) },
      } },
    ],
  }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('carrega o mesmo dashboard sem nenhuma chamada HTTP, inclusive em sessão nova', async () => {
    const fixture = TestBed.createComponent(ProjectDashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Modo demonstração: análise salva');
    expect(element.textContent).toContain(DEMO_REVISION);
    expect(element.querySelector('.dashboard__score')?.textContent).toContain('74/100');
    expect(element.querySelectorAll('.dimension-card')).toHaveLength(5);
    expect(element.querySelectorAll('.risk-card')).toHaveLength(10);
    expect(element.textContent).toContain(readDemoAnalysis().insight.message);
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it('não substitui um projeto arbitrário e não compartilha objetos mutáveis', () => {
    const service = TestBed.inject(AnalysisService);
    expect(service.getByProjectId('outro-projeto')).toBeUndefined();
    service.getDemoAnalysis().findings.length = 0;
    expect(service.getByProjectId(DEMO_PROJECT_ID)?.findings).toHaveLength(10);
    expect(DEMO_REVISION).toBe(snapshot.revision);
    expect(DEMO_REPOSITORY_URL).toBe(snapshot.repositoryUrl);
  });

  it('fixture ilustrativa e demo real respeitam contrato e mesmas chaves aninhadas', () => {
    const demo = readDemoAnalysis();
    const fixture = createAnalysisFixture();
    for (const result of [fixture, demo]) expect(isAnalysisResult(result, result.projectId)).toBe(true);
    expect(Object.keys(demo).sort()).toEqual(Object.keys(fixture).sort());
    expect(Object.keys(demo.insight).sort()).toEqual(Object.keys(fixture.insight).sort());
    for (const dimension of demo.dimensions)
      expect(Object.keys(dimension).sort()).toEqual(Object.keys(fixture.dimensions[0]).sort());
    for (const finding of demo.findings)
      expect(Object.keys(finding).sort()).toEqual(Object.keys(fixture.findings[0]).sort());
  });
});
