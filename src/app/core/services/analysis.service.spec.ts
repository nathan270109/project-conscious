import { AnalysisService } from './analysis.service';
import type { AnalysisResult } from '../models/analysis-result.model';

describe('AnalysisService — mock do insight', () => {
  const service = new AnalysisService();

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
    expect(result.dimensions.accessibility).toBe(Math.min(...Object.values(result.dimensions)));
    expect(result.insight?.category).toBe(result.findings[0].category);
    expect(result.insight?.message).toContain('Acessibilidade apresentou a menor nota: 60/100.');
    expect(result.insight?.message).toContain(result.findings[0].message);
    expect(result.insight?.message).toContain(result.findings[0].file!);
    expect(result.insight?.message).not.toContain('instalação');
  });

  it('permite representar insight ausente sem modificar o mock', () => {
    const result: AnalysisResult = { ...service.getByProjectId('1')!, insight: null };
    expect(result.insight).toBeNull();
    expect(service.getByProjectId('1')?.insight).not.toBeNull();
  });

  it('não devolve o mock para outro projeto', () => {
    expect(service.getByProjectId('inexistente')).toBeUndefined();
  });
});
