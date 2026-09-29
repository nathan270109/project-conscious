import { Injectable } from '@angular/core';
import type { AnalysisResult, CompletedAnalysisResult } from '../models/analysis-result.model';

@Injectable({
    providedIn: 'root'
})
export class AnalysisService {

    // Fixture ilustrativa da interface, não uma análise real do repositório-demo.
    // A comparação com o demo real permanece pendente na CONSCIOUS-47.
    private readonly mockResult: CompletedAnalysisResult = {
        projectId: '1',
        status: 'COMPLETED',
        analyzedAt: '2026-09-29T12:00:00.000Z',
        score: 80,
        dimensions: [
            { category: 'DOCUMENTATION', score: 65 },
            { category: 'TESTS', score: 95 },
            { category: 'ACCESSIBILITY', score: 60 },
            { category: 'ORGANIZATION', score: 100 },
            { category: 'MAINTAINABILITY', score: 80 }
        ],
        findings: [
            {
                category: 'DOCUMENTATION',
                severity: 'HIGH',
                message: 'README sem instruções de execução',
                file: 'README.md',
                line: null
            },
            {
                category: 'ACCESSIBILITY',
                severity: 'HIGH',
                message: 'Imagem sem atributo alt',
                file: 'src/app/feats/home/home.html',
                line: 34
            },
            {
                category: 'TESTS',
                severity: 'MEDIUM',
                message: 'Área importante do projeto sem arquivo de teste',
                file: 'src/app/feats/home/home.ts',
                line: null
            },
            {
                category: 'MAINTAINABILITY',
                severity: 'LOW',
                message: 'console.log encontrado no código',
                file: 'src/app/feats/home/home.ts',
                line: 18
            }
        ],
        insight: {
            category: 'DOCUMENTATION',
            title: 'Comece pela documentação',
            message:
                'Acessibilidade apresentou a menor nota: 60/100. ' +
                'Como primeira ação, revise o apontamento de documentação: ' +
                'README sem instruções de execução. ' +
                'Revise esse apontamento no arquivo README.md.'
        },
        demoMode: true
    };

    getByProjectId(id: string): AnalysisResult | undefined {
        if (this.mockResult.projectId === id) {
            return structuredClone(this.mockResult);
        }

        return undefined;
    }

}
