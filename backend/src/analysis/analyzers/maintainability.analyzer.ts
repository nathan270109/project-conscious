import { Injectable } from '@nestjs/common';
import { RepositoryFile } from '../../github/github.service.js';
import { Analyzer } from './analyzer.interface.js';
import { AnalyzerResult, Finding } from '../types/analysis.types.js';

/** Procura sinais simples de manutenção difícil em arquivos do repositório. */
@Injectable()
export class MaintainabilityAnalyzer implements Analyzer {
  /** Arquivos acima deste tamanho merecem revisão, mas não são automaticamente bugs. */
  private static readonly MAX_LINES = 300;

  /** Encontra TODOs, console.log e arquivos extensos com suas evidências. */
  analyze(files: RepositoryFile[]): AnalyzerResult {
    const findings: Finding[] = [];

    for (const file of files) {
      const lines = (file.content ?? '').split(/\r?\n/);

      lines.forEach((lineContent, index) => {
        const line = index + 1;

        if (/\bTODO\b/i.test(lineContent)) {
          findings.push({
            category: 'MAINTAINABILITY',
            severity: 'LOW',
            message: 'TODO indica uma pendência de manutenção.',
            file: file.path,
            line,
          });
        }

        if (/\bconsole\.log\s*\(/.test(lineContent)) {
          findings.push({
            category: 'MAINTAINABILITY',
            severity: 'LOW',
            message:
              'console.log é um sinal de manutenção; confirme se o log é intencional.',
            file: file.path,
            line,
          });
        }
      });

      if (lines.length > MaintainabilityAnalyzer.MAX_LINES) {
        findings.push({
          category: 'MAINTAINABILITY',
          severity: 'MEDIUM',
          message: `Arquivo possui ${lines.length} linhas; o limite é ${MaintainabilityAnalyzer.MAX_LINES}.`,
          file: file.path,
          line: null,
        });
      }
    }

    return {
      category: 'MAINTAINABILITY',
      score: Math.max(0, 100 - findings.length * 10),
      findings,
    };
  }
}