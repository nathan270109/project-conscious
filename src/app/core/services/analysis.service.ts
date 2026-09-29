import { Injectable } from '@angular/core';
import { AnalysisResult } from '../models/analysis-result.model';

@Injectable({
    providedIn: 'root'
})
export class AnalysisService {

    // Fixture ilustrativa da interface, não uma análise real do repositório-demo.
    // A integração completa dos demais campos do contrato pertence à CONSCIOUS-47.
    private readonly mockResult: AnalysisResult = {
        projectId: '1',
        status: 'COMPLETED',
        score: 80,
        dimensions: {
            documentation: 65,
            tests: 95,
            accessibility: 60,
            organization: 100,
            maintainability: 80
        },
        findings: [
            {
                category: 'DOCUMENTATION',
                severity: 'HIGH',
                message: 'README sem instruções de execução',
                file: 'README.md'
            },
            {
                category: 'TESTS',
                severity: 'MEDIUM',
                message: 'Área importante do projeto sem arquivo de teste',
                file: 'src/app/feats/home/home.ts'
            },
            {
                category: 'ACCESSIBILITY',
                severity: 'HIGH',
                message: 'Imagem sem atributo alt',
                file: 'src/app/feats/home/home.html',
                line: 34
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
            return this.mockResult;
        }

        return undefined;
    }

}
