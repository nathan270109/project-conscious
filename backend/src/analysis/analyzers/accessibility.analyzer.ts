import { Injectable } from '@nestjs/common';
import { RepositoryFile } from '../../github/github.service.js';
import { Analyzer } from './analyzer.interface.js';
import {
    AnalyzerResult,
    Finding,
} from '../types/analysis.types.js';

@Injectable() // Marca a classe como um serviço injetável do NestJS
export class AccessibilityAnalyzer implements Analyzer {

    // Método principal que executa a análise em todos os arquivos fornecidos
    analyze(files: RepositoryFile[]): AnalyzerResult {
        // Filtra apenas os arquivos que possuem extensão HTML ou HTM
        const htmlFiles = files.filter((file) => this.isHtmlFile(file.path));

        // Analisa cada arquivo HTML encontrado e agrupa todos os problemas encontrados (findings)
        const findings = htmlFiles.flatMap((file) =>
            this.analyzeHtmlFile(file),
        );

        // Retorna o resultado da análise de acessibilidade com pontuação calculada (desconta 20 pontos por erro, mínimo 0)
        return {
            category: 'ACCESSIBILITY',
            score: Math.max(0, 100 - findings.length * 20),
            findings,
        };
    }

    // Analisa o conteúdo de um arquivo HTML específico em busca de violações de acessibilidade
    private analyzeHtmlFile(file: RepositoryFile): Finding[] {
        const content = file.content ?? '';
        const findings: Finding[] = [];

        // Regra 1: Procura por tags <img> que não possuem o atributo obrigatório 'alt'
        for (const match of content.matchAll(
            /<img\b(?![^>]*\balt\s*=)[^>]*>/gi,
        )) {
            findings.push({
                category: 'ACCESSIBILITY',
                severity: 'HIGH',
                message: 'Imagem sem atributo alt.',
                file: file.path,
                line: this.getLineNumber(content, match.index ?? 0),
            });
        }

        // Regra 2: Procura por tags <input> e valida se possuem rótulo/label associada
        for (const match of content.matchAll(/<input\b[^>]*>/gi)) {
            const inputTag = match[0];

            if (!this.hasAssociatedLabel(inputTag, content)) {
                findings.push({
                    category: 'ACCESSIBILITY',
                    severity: 'HIGH',
                    message: 'Campo input sem label associada.',
                    file: file.path,
                    line: this.getLineNumber(content, match.index ?? 0),
                });
            }
        }

        // Regra 3: Procura por botões vazios (<button></button>) sem texto interno ou atributo 'aria-label'
        for (const match of content.matchAll(
            /<button\b(?![^>]*\baria-label\s*=)[^>]*>\s*<\/button>/gi,
        )) {
            findings.push({
                category: 'ACCESSIBILITY',
                severity: 'MEDIUM',
                message: 'Botão sem texto ou nome acessível.',
                file: file.path,
                line: this.getLineNumber(content, match.index ?? 0),
            });
        }

        return findings;
    }

    // Verifica se a tag <input> possui um ID mapeado para uma tag <label for="..."> correspondente no documento
    private hasAssociatedLabel(inputTag: string, content: string): boolean {
        const idMatch = inputTag.match(/\bid\s*=\s*["']([^"']+)["']/i);

        if (!idMatch) {
            return false;
        }

        const inputId = idMatch[1];
        const labelPattern = new RegExp(
            `<label\\b[^>]*\\bfor\\s*=\\s*["']${inputId}["'][^>]*>`,
            'i',
        );

        return labelPattern.test(content);
    }

    // Valida se a extensão do arquivo corresponde a um documento HTML (.html ou .htm)
    private isHtmlFile(path: string): boolean {
        return /\.html?$/i.test(path);
    }

    // Calcula o número da linha correspondente ao índice do caractere onde o problema foi encontrado
    private getLineNumber(content: string, index: number): number {
        return content.slice(0, index).split(/\r?\n/).length;
    }
}