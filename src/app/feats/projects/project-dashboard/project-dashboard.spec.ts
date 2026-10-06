import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AnalysisService } from '../../../core/services/analysis.service';
import { createAnalysisFixture } from '../../../core/testing/analysis.fixture';
import type { AnalysisResult, CompletedAnalysisResult, FailedAnalysisResult } from '../../../core/models/analysis-result.model';
import { ProjectDashboard } from './project-dashboard';

describe('ProjectDashboard — contrato de análise', () => {
  function completed(): CompletedAnalysisResult {
    const result = createAnalysisFixture();
    if (result?.status !== 'COMPLETED') throw new Error('Fixture de sucesso ausente');
    return result;
  }

  async function render(result: AnalysisResult | undefined, throws = false, loading = false) {
    await TestBed.configureTestingModule({
      imports: [ProjectDashboard],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        { provide: AnalysisService, useValue: { getProjectById: () => undefined, getByProjectId: () => {
          if (throws) throw new Error('Detalhe interno não deve ser exibido');
          return result;
        } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectDashboard);
    fixture.componentInstance.loading = loading;
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renderiza cinco dimensões, notas e insight como título e mensagem', async () => {
    const result = completed();
    const { element } = await render(result);
    expect(element.querySelectorAll('.dimension-card').length).toBe(5);
    expect(Array.from(element.querySelectorAll('[role="progressbar"]')).map(e => e.getAttribute('aria-valuenow')))
      .toEqual(result.dimensions.map(d => String(d.score)));
    expect(element.querySelector('.dashboard__score')?.textContent).toContain('80/100');
    expect(element.textContent).toContain(result.insight.title);
    expect(element.textContent).toContain(result.insight.message);
    expect(element.querySelectorAll('#insight-title').length).toBe(1);
    expect(element.querySelector('.insight__text h3')?.textContent).toContain(result.insight.title);
    expect(element.querySelector('.insight__text p')?.textContent).toContain(result.insight.message);
    expect(element.querySelector('.insight__context')?.textContent).toContain('métricas e evidências');
    expect(element.textContent).not.toContain('[object Object]');
    expect(element.textContent).toContain('Modo demonstração');
  });

  it('mostra FAILED sem nota, dimensões, insight ou falsa ausência de riscos', async () => {
    const failed: FailedAnalysisResult = {
      projectId: '1', analyzedAt: '2026-09-29T12:00:00.000Z', status: 'FAILED',
      score: null, dimensions: [], findings: [], insight: null,
      error: { code: 'ANALYSIS_FAILED', message: 'Não foi possível analisar o repositório.' },
    };
    const { element } = await render(failed);
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(failed.error.message);
    expect(element.querySelector('.dashboard__score')).toBeNull();
    expect(element.querySelector('.dimension-card')).toBeNull();
    expect(element.querySelector('#insight-title')).toBeNull();
    expect(element.textContent).not.toContain('Nenhum risco');
  });

  it('preserva a ordem recebida sem alterar os dados da fonte', async () => {
    const result = completed();
    // Ordem proposital para detectar qualquer reordenação no consumidor.
    result.findings.reverse();
    const original = structuredClone(result);
    const { element } = await render(result);
    expect(Array.from(element.querySelectorAll('.risk-card__message')).map(e => e.textContent?.trim()))
      .toEqual(original.findings.map(f => f.message));
    expect(result).toEqual(original);
  });

  it('aceita sucesso sem findings e mantém o insight neutro fornecido', async () => {
    const result = completed();
    result.findings = [];
    result.insight = { category: 'DOCUMENTATION', title: 'Análise concluída', message: 'Nenhum apontamento identificado.' };
    const { element } = await render(result);
    expect(element.textContent).toContain('Nenhum risco foi encontrado');
    expect(element.textContent).toContain(result.insight.message);
  });

  it('mostra arquivo sem sufixo de linha quando line é null', async () => {
    const { element } = await render(completed());
    expect(element.querySelector('.risk-card__file')?.textContent?.trim()).toBe('README.md');
    expect(element.textContent).not.toContain(':null');
  });

  it('preserva estado de análise não encontrada', async () => {
    const { element } = await render(undefined);
    expect(element.textContent).toContain('Análise não encontrada');
    expect(element.querySelector('.dashboard__score')).toBeNull();
  });

  it('preserva erro de carregamento sem expor detalhes internos', async () => {
    const { element } = await render(undefined, true);
    expect(element.textContent).toContain('Não foi possível carregar a análise.');
    expect(element.textContent).not.toContain('Detalhe interno');
  });

  it('preserva estado de carregamento', async () => {
    const { element } = await render(completed(), false, true);
    expect(element.textContent).toContain('Carregando análise');
    expect(element.querySelector('.dashboard__score')).toBeNull();
  });
});
