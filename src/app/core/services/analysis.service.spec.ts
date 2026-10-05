import { AnalysisService } from './analysis.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { createAnalysisFixture } from '../testing/analysis.fixture';

describe('AnalysisService — contrato e cache de resultado', () => {
  let service: AnalysisService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AnalysisService);
    http = TestBed.inject(HttpTestingController);
    expect(service.getByProjectId('1')).toBeUndefined();
    service.analyze('1').subscribe();
    http.expectOne('/api/projects/1/analyze').flush(createAnalysisFixture());
  });
  afterEach(() => http.verify());

  it('retorna o insight como objeto com os campos do contrato', () => {
    expect(service.getByProjectId('1')?.insight).toEqual({
      category: 'DOCUMENTATION',
      title: 'Comece pela documentação',
      message:
        'Acessibilidade apresentou a menor nota: 60/100. ' +
        'Como primeira ação, revise o apontamento de documentação: ' +
        'README sem instruções de execução. ' +
        'Revise esse apontamento no arquivo README.md.',
    });
  });

  it('distingue a menor dimensão da categoria do primeiro finding', () => {
    const result = service.getByProjectId('1')!;
    expect(result.dimensions.find((d) => d.category === 'ACCESSIBILITY')?.score).toBe(
      Math.min(...result.dimensions.map((d) => d.score)),
    );
    expect(result.insight?.category).toBe(result.findings[0].category);
    expect(result.insight?.message).toContain('Acessibilidade apresentou a menor nota: 60/100.');
    expect(result.insight?.message).toContain(result.findings[0].message);
    expect(result.insight?.message).toContain(result.findings[0].file!);
    expect(result.insight?.message).not.toContain('instalação');
  });

  it('retorna uma cópia para não modificar a fixture entre consumidores', () => {
    const result = service.getByProjectId('1')!;
    result.findings.reverse();
    result.dimensions[0].score = 0;
    expect(service.getByProjectId('1')?.findings[0].category).toBe('DOCUMENTATION');
    expect(service.getByProjectId('1')?.dimensions[0].score).toBe(65);
  });

  it('usa as chaves e os valores obrigatórios do contrato de sucesso', () => {
    const result = service.getByProjectId('1')!;
    expect(Object.keys(result).sort()).toEqual(
      [
        'projectId',
        'status',
        'analyzedAt',
        'score',
        'dimensions',
        'findings',
        'insight',
        'demoMode',
      ].sort(),
    );
    expect(result.status).toBe('COMPLETED');
    expect(new Date(result.analyzedAt).toISOString()).toBe(result.analyzedAt);
    expect(result.dimensions.map((d) => d.category)).toEqual([
      'DOCUMENTATION',
      'TESTS',
      'ACCESSIBILITY',
      'ORGANIZATION',
      'MAINTAINABILITY',
    ]);
    for (const dimension of result.dimensions) {
      expect(Object.keys(dimension).sort()).toEqual(['category', 'score']);
      expect(dimension.score).toBeGreaterThanOrEqual(0);
      expect(dimension.score).toBeLessThanOrEqual(100);
    }
    for (const finding of result.findings) {
      expect(Object.keys(finding).sort()).toEqual([
        'category',
        'file',
        'line',
        'message',
        'severity',
      ]);
      expect(finding.file.length).toBeGreaterThan(0);
      expect(finding.line === null || (Number.isInteger(finding.line) && finding.line > 0)).toBe(
        true,
      );
    }
    expect(result.error).toBeUndefined();
  });

  it('não devolve o mock para outro projeto', () => {
    expect(service.getByProjectId('inexistente')).toBeUndefined();
  });
});
