import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import type {
  AnalysisCategory,
  Finding,
} from '../analysis/types/analysis.types.js';
import { InsightsModule } from './insights.module.js';
import { InsightsService } from './insights.service.js';

describe('InsightsService', () => {
  const service = new InsightsService();

  it('retorna a convenção sem findings sem afirmar ausência de problemas', () => {
    expect(service.generate([])).toEqual({
      category: 'DOCUMENTATION',
      title: 'Nenhum risco identificado',
      message: 'As regras executadas não identificaram findings nesta análise.',
    });
  });

  it('inclui arquivo e linha quando disponíveis', () => {
    expect(
      service.generate([
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
        'README não possui instruções de instalação. ' +
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

    expect(service.generate(findings)).toEqual({
      category: 'ACCESSIBILITY',
      title: 'Melhore a acessibilidade',
      message:
        'Imagem sem texto alternativo. ' +
        'Revise esse apontamento no arquivo src/app.html.',
    });
    expect(findings).toEqual(original);
    expect(service.generate(findings)).toEqual(service.generate(findings));
  });

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
        service.generate([
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
          'Apontamento de exemplo. ' +
          'Revise esse apontamento no arquivo src/example.ts.',
      });
    },
  );

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
