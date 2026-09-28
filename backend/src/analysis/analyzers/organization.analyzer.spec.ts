import { OrganizationAnalyzer } from './organization.analyzer.js';

describe('OrganizationAnalyzer', () => {
  const analyzer = new OrganizationAnalyzer();

  it('accepts a path at the six-directory limit', () => {
    const result = analyzer.analyze([
      { path: 'one/two/three/four/five/six/file.ts', content: '' },
    ]);

    expect(result.findings).toEqual([]);
  });

  it('reports paths deeper than six directories as medium severity', () => {
    const result = analyzer.analyze([
      { path: 'one/two/three/four/five/six/seven/file.ts', content: '' },
    ]);

    expect(result.findings).toEqual([
      {
        category: 'ORGANIZATION',
        severity: 'MEDIUM',
        message:
          'Caminho possui 7 níveis de pastas; o limite é 6.',
        file: 'one/two/three/four/five/six/seven/file.ts',
        line: null,
      },
    ]);
  });

  it('reports names outside the lowercase kebab-case convention', () => {
    const result = analyzer.analyze([
      { path: 'src/Bad_Folder/BadFile.ts', content: '' },
    ]);

    expect(result.findings).toEqual([
      {
        category: 'ORGANIZATION',
        severity: 'LOW',
        message:
          'Nome de arquivo ou pasta fora do padrão: use letras minúsculas, números e hífens.',
        file: 'src/Bad_Folder/BadFile.ts',
        line: null,
      },
    ]);
  });
});