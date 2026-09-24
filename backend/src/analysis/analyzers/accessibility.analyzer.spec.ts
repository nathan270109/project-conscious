import { AccessibilityAnalyzer } from './accessibility.analyzer.js';

// Bloco de testes unitários para a classe AccessibilityAnalyzer
describe('AccessibilityAnalyzer', () => {
    const analyzer = new AccessibilityAnalyzer();

    // Cenário 1: Garante que um HTML totalmente acessível retorna pontuação máxima e nenhum erro (findings)
    it('returns no findings for accessible HTML', () => {
        const result = analyzer.analyze([
            {
                path: 'src/app.html',
                content: `
          <label for="email">E-mail</label>
          <input id="email" type="email">
          <img src="logo.png" alt="Logo Project Conscious">
          <button>Enviar</button>
        `,
            },
        ]);

        expect(result.score).toBe(100);
        expect(result.findings).toEqual([]);
    });

    // Cenário 2: Valida se detecta corretamente uma tag <img> que não possui o atributo 'alt' obrigatório
    it('finds an image without alt', () => {
        const result = analyzer.analyze([
            {
                path: 'src/app.html',
                content: '<img src="dashboard.png">',
            },
        ]);

        expect(result.findings).toEqual([
            {
                category: 'ACCESSIBILITY',
                severity: 'HIGH',
                message: 'Imagem sem atributo alt.',
                file: 'src/app.html',
                line: 1,
            },
        ]);
    });

    // Cenário 3: Valida se detecta um campo <input> que não possui uma tag <label for="..."> correspondente
    it('finds an input without an associated label', () => {
        const result = analyzer.analyze([
            {
                path: 'src/app.html',
                content: '<input id="email" type="email">',
            },
        ]);

        expect(result.findings).toHaveLength(1);
        expect(result.findings[0].message).toBe(
            'Campo input sem label associada.',
        );
    });

    // Cenário 4: Valida se detecta um botão vazio (<button></button>) sem conteúdo de texto ou nome acessível
    it('finds a button without text or accessible name', () => {
        const result = analyzer.analyze([
            {
                path: 'src/app.html',
                content: '<button></button>',
            },
        ]);

        expect(result.findings).toHaveLength(1);
        expect(result.findings[0].message).toBe(
            'Botão sem texto ou nome acessível.',
        );
    });

    // Cenário 5: Garante que o analisador ignora conteúdos parecidos com HTML dentro de arquivos TypeScript (.ts) para evitar falsos positivos
    it('ignores HTML-like content in TypeScript files', () => {
        const result = analyzer.analyze([
            {
                path: 'src/example.ts',
                content: 'const template = "<img src=\\"logo.png\\">";',
            },
        ]);

        expect(result.score).toBe(100);
        expect(result.findings).toEqual([]);
    });
});