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
    it('uses category and file as deterministic tie breakers', () => {
        const findings = [
            {
                category: 'TESTS' as const,
                severity: 'HIGH' as const,
                message: 'Teste A.',
                file: 'z.test.ts',
                line: 1,
            },
            {
                category: 'ACCESSIBILITY' as const,
                severity: 'HIGH' as const,
                message: 'Imagem sem alt.',
                file: 'src/app.html',
                line: 2,
            },
        ];

        // Ordena os itens que possuem severidade idêntica
        const sortedFindings = service.sortByPriority(findings);

        // Verifica se o critério de desempate alfabético por categoria posiciona 'ACCESSIBILITY' antes de 'TESTS'
        expect(sortedFindings[0].category).toBe('ACCESSIBILITY');
        expect(sortedFindings[1].category).toBe('TESTS');
    });
});