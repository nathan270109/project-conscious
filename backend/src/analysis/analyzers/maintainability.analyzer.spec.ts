import { MaintainabilityAnalyzer } from './maintainability.analyzer.js';

describe('MaintainabilityAnalyzer', () => {
  const analyzer = new MaintainabilityAnalyzer();

  it('does not report a file at the 300-line limit', () => {
    const result = analyzer.analyze([
      { path: 'src/file.ts', content: Array(300).fill('const value = 1;').join('\n') },
    ]);

    expect(result.findings).toEqual([]);
  });

  it('reports files above 300 lines as medium severity', () => {
    const result = analyzer.analyze([
      { path: 'src/file.ts', content: Array(301).fill('const value = 1;').join('\n') },
    ]);

    expect(result.findings).toEqual([
      {
        category: 'MAINTAINABILITY',
        severity: 'MEDIUM',
        message: 'Arquivo possui 301 linhas; o limite é 300.',
        file: 'src/file.ts',
        line: null,
      },
    ]);
  });

  it('reports TODO and console.log with their exact lines', () => {
    const result = analyzer.analyze([
      {
        path: 'src/file.ts',
        content: 'const value = 1;\n// TODO: revisar\nconsole.log(value);',
      },
    ]);

    expect(result.findings).toEqual([
      {
        category: 'MAINTAINABILITY',
        severity: 'LOW',
        message: 'TODO indica uma pendência de manutenção.',
        file: 'src/file.ts',
        line: 2,
      },
      {
        category: 'MAINTAINABILITY',
        severity: 'LOW',
        message:
          'console.log é um sinal de manutenção; confirme se o log é intencional.',
        file: 'src/file.ts',
        line: 3,
      },
    ]);
  });
});