import { TestsAnalyzer } from './tests.analyzer.js';

// Bloco de testes unitários para a classe TestsAnalyzer
describe('TestsAnalyzer', () => {
    const analyzer = new TestsAnalyzer();

    // Cenário 1: Garante que a pontuação é 100 e não há erros quando existem arquivos de teste (.spec.ts)
    it('returns score 100 when test files exist', () => {
        const result = analyzer.analyze([
            {
                path: 'src/app.ts',
                content: 'export const app = true;',
            },
            {
                path: 'src/app.spec.ts', // Arquivo de teste presente
                content: 'describe("App", () => {});',
            },
        ]);

        // Valida o sucesso do resultado esperado
        expect(result.score).toBe(100);
        expect(result.findings).toEqual([]);
    });

    // Cenário 2: Garante que retorna nota 0 e um alerta de alta severidade quando nenhum arquivo de teste é enviado
    it('returns a high severity finding when no test file exists', () => {
        const result = analyzer.analyze([
            {
                path: 'src/app.ts',
                content: 'export const app = true;',
                // Nenhum arquivo .spec ou .test presente
            },
        ]);

        // Valida se o score foi zerado e o finding de erro foi gerado corretamente
        expect(result.score).toBe(0);
        expect(result.findings).toEqual([
            {
                category: 'TESTS',
                severity: 'HIGH',
                message: 'Nenhum arquivo de teste foi encontrado no repositório.',
                file: 'tests',
                line: null,
            },
        ]);
    });
});