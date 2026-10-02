import { RisksService } from './risks.service.js';

// Suíte de testes unitários para o RisksService
describe('RisksService', () => {
  // Instancia o serviço que será testado
  const service = new RisksService();

  // Testa se os achados são ordenados corretamente do mais severo (CRITICAL) para o menos severo (LOW)
  it('sorts findings from critical to low severity', () => {
    // Mock de dados com diferentes níveis de severidade espalhados
    const findings = [
      {
        category: 'DOCUMENTATION' as const,
        severity: 'LOW' as const,
        message: 'README incompleto.',
        file: 'README.md',
        line: null,
      },
      {
        category: 'TESTS' as const,
        severity: 'HIGH' as const,
        message: 'Nenhum teste encontrado.',
        file: 'tests',
        line: null,
      },
      {
        category: 'ACCESSIBILITY' as const,
        severity: 'CRITICAL' as const,
        message: 'Imagem sem alt.',
        file: 'src/app.html',
        line: 3,
      },
      {
        category: 'ORGANIZATION' as const,
        severity: 'MEDIUM' as const,
        message: 'Pasta genérica encontrada.',
        file: 'misc/data.ts',
        line: null,
      },
    ];

    // Aplica o método de ordenação
    const sortedFindings = service.sortByPriority(findings);

    // Valida se a sequência resultante obedece rigorosamente à hierarquia de severidade esperada
    expect(sortedFindings.map((finding) => finding.severity)).toEqual([
      'CRITICAL',
      'HIGH',
      'MEDIUM',
      'LOW',
    ]);
  });

  // Testa a garantia de imutabilidade (o array original passado por parâmetro não deve ser alterado)
  it('does not modify the original findings array', () => {
    const findings = [
      {
        category: 'DOCUMENTATION' as const,
        severity: 'LOW' as const,
        message: 'README incompleto.',
        file: 'README.md',
        line: null,
      },
      {
        category: 'TESTS' as const,
        severity: 'HIGH' as const,
        message: 'Nenhum teste encontrado.',
        file: 'tests',
        line: null,
      },
    ];

    // Executa a ordenação sem reatribuir o resultado
    service.sortByPriority(findings);

    // Confirma que a ordem do array original permaneceu intacta
    expect(findings.map((finding) => finding.severity)).toEqual([
      'LOW',
      'HIGH',
    ]);
  });

  // Testa se o desempate funciona de forma determinística quando os itens possuem o mesmo nível de severidade
  it('uses category, file and line as deterministic tie breakers', () => {
    const findings = [
      {
        category: 'TESTS' as const,
        severity: 'HIGH' as const,
        message: 'Finding da linha 8.',
        file: 'src/b.test.ts',
        line: 8,
      },
      {
        category: 'TESTS' as const,
        severity: 'HIGH' as const,
        message: 'Finding da linha 5.',
        file: 'src/a.test.ts',
        line: 5,
      },
      {
        category: 'TESTS' as const,
        severity: 'HIGH' as const,
        message: 'Finding da linha 2.',
        file: 'src/a.test.ts',
        line: 2,
      },
      {
        category: 'ACCESSIBILITY' as const,
        severity: 'HIGH' as const,
        message: 'Imagem sem alt.',
        file: 'src/z.html',
        line: 10,
      },
    ];

    const sortedFindings = service.sortByPriority(findings);

    expect(
      sortedFindings.map((finding) => ({
        category: finding.category,
        file: finding.file,
        line: finding.line,
      })),
    ).toEqual([
      {
        category: 'ACCESSIBILITY',
        file: 'src/z.html',
        line: 10,
      },
      {
        category: 'TESTS',
        file: 'src/a.test.ts',
        line: 2,
      },
      {
        category: 'TESTS',
        file: 'src/a.test.ts',
        line: 5,
      },
      {
        category: 'TESTS',
        file: 'src/b.test.ts',
        line: 8,
      },
    ]);
  });
});
