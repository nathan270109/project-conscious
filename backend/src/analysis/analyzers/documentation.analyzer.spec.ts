import { DocumentationAnalyzer } from './documentation.analyzer.js';

describe('DocumentationAnalyzer', () => {
  const analyzer = new DocumentationAnalyzer();

  it('returns score 100 when README has description, installation and execution', () => {
    const result = analyzer.analyze([
      {
        path: 'README.md',
        content: `
          # Project Conscious

          ## Descrição
          Plataforma para análise de software.

          ## Instalação
          npm install

          ## Como executar
          npm run start
        `,
      },
    ]);

    expect(result.score).toBe(100);
    expect(result.findings).toEqual([]);
  });

  it('returns findings when README is incomplete', () => {
    const result = analyzer.analyze([
      {
        path: 'README.md',
        content: '# Project Conscious\n\nProjeto de demonstração.',
      },
    ]);

    expect(result.score).toBe(10);
    expect(result.findings).toHaveLength(3);
    expect(result.findings[0].message).toBe(
      'README não possui uma descrição do projeto.',
    );
  });

  it('returns a high severity finding when README does not exist', () => {
    const result = analyzer.analyze([
      {
        path: 'src/app.ts',
        content: 'export const app = true;',
      },
    ]);

    expect(result.score).toBe(0);
    expect(result.findings).toEqual([
      {
        category: 'DOCUMENTATION',
        severity: 'HIGH',
        message: 'README não encontrado no repositório.',
        file: 'README',
        line: null,
      },
    ]);
  });
});