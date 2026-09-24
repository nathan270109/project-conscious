import { Injectable } from '@nestjs/common';
import { RepositoryFile } from '../../github/github.service.js';
import { Analyzer } from './analyzer.interface.js';
import { AnalyzerResult } from '../types/analysis.types.js';

@Injectable() // Torna a classe um serviço injetável no NestJS
export class TestsAnalyzer implements Analyzer {
    analyze(files: RepositoryFile[]): AnalyzerResult {
        // Filtra os arquivos do repositório procurando por extensões válidas de teste (.spec.ts, .test.ts, etc.)
        const testFiles = files.filter((file) => this.isTestFile(file.path));

        // Se nenhum arquivo de teste for encontrado, retorna uma pontuação zero e um alerta (finding) de alta severidade
        if (testFiles.length === 0) {
            return {
                category: 'TESTS',
                score: 0,
                findings: [
                    {
                        category: 'TESTS',
                        severity: 'HIGH',
                        message: 'Nenhum arquivo de teste foi encontrado no repositório.',
                        file: 'tests',
                        line: null,
                    },
                ],
            };
        }

        // Se houver arquivos de teste, retorna pontuação máxima e nenhum erro
        return {
            category: 'TESTS',
            score: 100,
            findings: [],
        };
    }

    // Valida através de expressão regular se o caminho do arquivo corresponde a um arquivo de teste
    private isTestFile(path: string): boolean {
        return /\.(spec|test)\.(ts|js)$/i.test(path);
    }
}
