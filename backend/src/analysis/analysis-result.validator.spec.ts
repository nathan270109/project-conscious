import { InternalServerErrorException } from '@nestjs/common';
import { validateAnalysisResult } from './analysis-result.validator.js';

function sparseArray(length: number): unknown[] {
  const result: unknown[] = [];
  result.length = length;
  return result;
}

const validResult = () => ({
  score: 95,
  dimensions: [
    'DOCUMENTATION',
    'TESTS',
    'ACCESSIBILITY',
    'ORGANIZATION',
    'MAINTAINABILITY',
  ].map((category) => ({ category, score: 95 })),
  findings: [
    {
      category: 'TESTS',
      severity: 'HIGH',
      message: 'Teste ausente.',
      file: 'tests',
      line: null as number | null,
    },
  ],
  insight: {
    category: 'TESTS',
    title: 'Revise os testes',
    message: 'Revise o apontamento.',
  },
});

describe('validateAnalysisResult', () => {
  it('aceita resultado válido sem modificá-lo', () => {
    const result = validResult();
    const original = structuredClone(result);
    expect(() => validateAnalysisResult(result)).not.toThrow();
    expect(result).toEqual(original);
  });

  it('aceita findings vazios e notas nos limites', () => {
    const result = { ...validResult(), score: 0, findings: [] };
    result.dimensions[0].score = 100;
    expect(() => validateAnalysisResult(result)).not.toThrow();
  });

  it('aceita linha inteira positiva', () => {
    const result = validResult();
    result.findings[0].line = 1;
    expect(() => validateAnalysisResult(result)).not.toThrow();
  });

  const invalidResults: Array<[string, unknown]> = [
    ['undefined', undefined],
    ['null', null],
    ['array', []],
    ['objeto vazio', {}],
    ['score textual', { ...validResult(), score: '95' }],
    ['score infinito', { ...validResult(), score: Infinity }],
    ['dimensões ausentes', { ...validResult(), dimensions: undefined }],
    [
      'dimensão nula',
      {
        ...validResult(),
        dimensions: [null, ...validResult().dimensions.slice(1)],
      },
    ],
    [
      'categoria repetida',
      {
        ...validResult(),
        dimensions: Array(5).fill({ category: 'TESTS', score: 90 }),
      },
    ],
    [
      'array de dimensões esparso',
      { ...validResult(), dimensions: sparseArray(5) },
    ],
    [
      'nota inválida',
      {
        ...validResult(),
        dimensions: validResult().dimensions.map((d) => ({ ...d, score: -1 })),
      },
    ],
    ['findings ausentes', { ...validResult(), findings: undefined }],
    ['findings como objeto', { ...validResult(), findings: {} }],
    ['finding nulo', { ...validResult(), findings: [null] }],
    ['findings esparsos', { ...validResult(), findings: sparseArray(1) }],
    ['insight ausente', { ...validResult(), insight: undefined }],
    ['insight nulo', { ...validResult(), insight: null }],
    ['insight textual', { ...validResult(), insight: 'Texto' }],
    ...[{ category: 'OTHER' }, { title: '' }, { message: '  ' }].map(
      (change) =>
        [
          'insight inválido ' + JSON.stringify(change),
          {
            ...validResult(),
            insight: { ...validResult().insight, ...change },
          },
        ] as [string, unknown],
    ),
    ...[
      { category: 'OTHER' },
      { severity: 'OTHER' },
      { message: '' },
      { file: '  ' },
      { file: undefined },
      { line: undefined },
      { line: -1 },
      { line: 0 },
      { line: 1.5 },
      { line: '1' },
      { line: Infinity },
    ].map(
      (change) =>
        [
          'finding inválido ' + JSON.stringify(change),
          {
            ...validResult(),
            findings: [{ ...validResult().findings[0], ...change }],
          },
        ] as [string, unknown],
    ),
  ];

  it.each(invalidResults)('rejeita %s com erro seguro', (_name, result) => {
    expect(() => validateAnalysisResult(result)).toThrow(
      InternalServerErrorException,
    );
    expect(() => validateAnalysisResult(result)).toThrow(
      'O motor retornou um resultado de análise inválido.',
    );
  });
});
