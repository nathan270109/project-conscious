import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import type {
  AnalysisCategory,
  Finding,
  DimensionScore,
} from '../analysis/types/analysis.types.js';
import { InsightsModule } from './insights.module.js';
import { InsightsService } from './insights.service.js';

describe('InsightsService', () => {
  const service = new InsightsService();
  const dimensions: DimensionScore[] = [
    'DOCUMENTATION',
    'TESTS',
    'ACCESSIBILITY',
    'ORGANIZATION',
    'MAINTAINABILITY',
  ].map((category) => ({
    category: category as AnalysisCategory,
    score: category === 'DOCUMENTATION' ? 60 : 100,
  }));

  it('retorna a convenção sem findings sem afirmar ausência de problemas', () => {
    expect(service.generate(dimensions, [])).toEqual({
      category: 'DOCUMENTATION',
      title: 'Nenhum risco identificado',
      message: 'As regras executadas não identificaram findings nesta análise.',
    });
  });

  it('inclui arquivo e linha quando disponíveis', () => {
    expect(
      service.generate(dimensions, [
        {
          category: 'DOCUMENTATION',
          severity: 'HIGH',
          message: 'README não possui instruções de instalação.',
          file: 'README.md',
          line: 12,
        },
      ]),
    ).toEqual({
      category: 'DOCUMENTATION',
      title: 'Comece pela documentação',
      message:
        'Documentação apresentou a menor nota: 60/100. Como primeira ação, revise o apontamento de documentação: README não possui instruções de instalação. ' +
        'Revise esse apontamento no arquivo README.md:12.',
    });
  });

  it('respeita a ordem recebida sem mutar a lista ou os findings', () => {
    const findings: readonly Finding[] = Object.freeze([
      Object.freeze({
        category: 'ACCESSIBILITY' as const,
        severity: 'LOW' as const,
        message: 'Imagem sem texto alternativo.',
        file: 'src/app.html',
        line: null,
      }),
      Object.freeze({
        category: 'DOCUMENTATION' as const,
        severity: 'CRITICAL' as const,
        message: 'Documentação incompleta.',
        file: 'README.md',
        line: 5,
      }),
    ]);
    const original = findings.map((finding) => ({ ...finding }));

    expect(service.generate(dimensions, findings)).toEqual({
      category: 'ACCESSIBILITY',
      title: 'Melhore a acessibilidade',
      message:
        'Documentação apresentou a menor nota: 60/100. Como primeira ação, revise o apontamento de acessibilidade: Imagem sem texto alternativo. ' +
        'Revise esse apontamento no arquivo src/app.html.',
    });
    expect(findings).toEqual(original);
    expect(service.generate(dimensions, findings)).toEqual(
      service.generate(dimensions, findings),
    );
  });

  const categoryLabels = {
    DOCUMENTATION: 'documentação',
    TESTS: 'testes',
    ACCESSIBILITY: 'acessibilidade',
    ORGANIZATION: 'organização',
    MAINTAINABILITY: 'manutenibilidade',
  };

  const categoryCases: Array<[AnalysisCategory, string]> = [
    ['DOCUMENTATION', 'Comece pela documentação'],
    ['TESTS', 'Revise os testes'],
    ['ACCESSIBILITY', 'Melhore a acessibilidade'],
    ['ORGANIZATION', 'Revise a organização'],
    ['MAINTAINABILITY', 'Revise a manutenibilidade'],
  ];

  it.each(categoryCases)(
    'retorna somente os campos do contrato para %s',
    (category, title) => {
      expect(
        service.generate(dimensions, [
          {
            category,
            severity: 'MEDIUM',
            message: 'Apontamento de exemplo.',
            file: 'src/example.ts',
            line: null,
          },
        ]),
      ).toEqual({
        category,
        title,
        message:
          `Documentação apresentou a menor nota: 60/100. Como primeira ação, revise o apontamento de ${categoryLabels[category]}: Apontamento de exemplo. ` +
          'Revise esse apontamento no arquivo src/example.ts.',
      });
    },
  );

  const finding: Finding = {
    category: 'ACCESSIBILITY',
    severity: 'HIGH',
    message: 'Imagem sem alt.',
    file: 'src/app.html',
    line: 1,
  };

  it('menciona empates em ordem fixa independentemente da ordem das dimensões', () => {
    const tied = dimensions.map((d) => ({
      ...d,
      score: d.category === 'TESTS' ? 60 : d.score,
    }));
    const result = service.generate(tied, [finding]);
    expect(result.message).toContain(
      'Documentação e Testes apresentaram a menor nota: 60/100.',
    );
    expect(service.generate([...tied].reverse(), [finding])).toEqual(result);
  });

  it('atualiza o contexto quando a menor nota muda sem mudar a ação', () => {
    const changed = dimensions.map((d) => ({
      ...d,
      score: d.category === 'TESTS' ? 20 : d.score,
    }));
    expect(service.generate(changed, [finding]).message).toContain(
      'Testes apresentou a menor nota: 20/100.',
    );
    expect(service.generate(changed, [finding]).category).toBe('ACCESSIBILITY');
  });

  it('atualiza a ação quando o primeiro finding muda sem mudar a menor dimensão', () => {
    const other: Finding = {
      ...finding,
      category: 'TESTS',
      message: 'Teste ausente.',
      file: 'tests',
    };
    const result = service.generate(dimensions, [other, finding]);
    expect(result.category).toBe('TESTS');
    expect(result.message).toContain(
      'Documentação apresentou a menor nota: 60/100.',
    );
    expect(result.message).toContain('apontamento de testes: Teste ausente.');
  });

  it('não modifica dimensões congeladas e não escolhe pior dimensão sem findings', () => {
    const frozen = Object.freeze(
      dimensions.map((d) => Object.freeze({ ...d, score: 100 })),
    );
    const before = structuredClone(frozen);
    expect(service.generate(frozen, []).message).toBe(
      'As regras executadas não identificaram findings nesta análise.',
    );
    service.generate(frozen, [finding]);
    expect(frozen).toEqual(before);
  });

  it.each([
    undefined,
    [],
    [null],
    dimensions.slice(1),
    dimensions.map((d) => ({ ...d, category: 'TESTS' })),
    dimensions.map((d) => ({ ...d, score: NaN })),
  ])('rejeita dimensões inválidas mesmo sem findings: %j', (invalid) => {
    expect(() =>
      service.generate(invalid as unknown as DimensionScore[], []),
    ).toThrow('Entradas inválidas para geração do insight.');
  });

  it.each([
    undefined,
    [null],
    [{ ...finding, line: 0 }],
    [{ ...finding, severity: 'UNKNOWN' }],
  ])('rejeita findings inválidos: %j', (invalid) => {
    expect(() =>
      service.generate(dimensions, invalid as unknown as Finding[]),
    ).toThrow('Entradas inválidas para geração do insight.');
  });

  it('exporta o serviço para um módulo consumidor', async () => {
    const consumer = await Test.createTestingModule({
      imports: [InsightsModule],
      providers: [
        {
          provide: 'INSIGHTS_CONSUMER',
          inject: [InsightsService],
          useFactory: (insights: InsightsService) => insights,
        },
      ],
    }).compile();

    try {
      expect(consumer.get('INSIGHTS_CONSUMER')).toBeInstanceOf(InsightsService);
    } finally {
      await consumer.close();
    }
  });
});
