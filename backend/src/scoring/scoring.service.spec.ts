import { ScoringService } from './scoring.service.js';

describe('ScoringService', () => {
    const service = new ScoringService();

    it('returns score 100 in all dimensions when there are no findings', () => {
        const result = service.calculate([]);

        expect(result.score).toBe(100);
        expect(result.dimensions).toEqual([
            { category: 'DOCUMENTATION', score: 100 },
            { category: 'TESTS', score: 100 },
            { category: 'ACCESSIBILITY', score: 100 },
            { category: 'ORGANIZATION', score: 100 },
            { category: 'MAINTAINABILITY', score: 100 },
        ]);
    });

    it('calculates dimension scores and conscious score from known findings', () => {
        const result = service.calculate([
            {
                category: 'DOCUMENTATION',
                severity: 'HIGH',
                message: 'README não encontrado.',
                file: 'README',
                line: null,
            },
            {
                category: 'DOCUMENTATION',
                severity: 'MEDIUM',
                message: 'README não possui instalação.',
                file: 'README',
                line: null,
            },
            {
                category: 'TESTS',
                severity: 'LOW',
                message: 'Poucos testes encontrados.',
                file: 'src/app.spec.ts',
                line: 1,
            },
            {
                category: 'ACCESSIBILITY',
                severity: 'CRITICAL',
                message: 'Imagem sem texto alternativo.',
                file: 'src/app.html',
                line: 3,
            },
            {
                category: 'MAINTAINABILITY',
                severity: 'MEDIUM',
                message: 'TODO encontrado.',
                file: 'src/app.ts',
                line: 1,
            },
            {
                category: 'MAINTAINABILITY',
                severity: 'MEDIUM',
                message: 'console.log encontrado.',
                file: 'src/app.ts',
                line: 2,
            },
        ]);

        expect(result.dimensions).toEqual([
            { category: 'DOCUMENTATION', score: 65 },
            { category: 'TESTS', score: 95 },
            { category: 'ACCESSIBILITY', score: 60 },
            { category: 'ORGANIZATION', score: 100 },
            { category: 'MAINTAINABILITY', score: 80 },
        ]);

        expect(result.score).toBe(80);
    });

    it('never returns a score below zero', () => {
        const result = service.calculate([
            {
                category: 'DOCUMENTATION',
                severity: 'CRITICAL',
                message: 'Problema 1',
                file: 'README.md',
                line: null,
            },
            {
                category: 'DOCUMENTATION',
                severity: 'CRITICAL',
                message: 'Problema 2',
                file: 'README.md',
                line: null,
            },
            {
                category: 'DOCUMENTATION',
                severity: 'CRITICAL',
                message: 'Problema 3',
                file: 'README.md',
                line: null,
            },
        ]);

        expect(result.dimensions[0]).toEqual({
            category: 'DOCUMENTATION',
            score: 0,
        });
    });
});