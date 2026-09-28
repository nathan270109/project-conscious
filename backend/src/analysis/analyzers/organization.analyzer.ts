import { Injectable } from '@nestjs/common';
import { RepositoryFile } from '../../github/github.service.js';
import { Analyzer } from './analyzer.interface.js';
import { AnalyzerResult, Finding } from '../types/analysis.types.js';

/** Verifica a profundidade dos caminhos e a convenção de nomes do repositório. */
@Injectable()
export class OrganizationAnalyzer implements Analyzer {
  /** Mantém caminhos com até seis diretórios fáceis de navegar. */
  private static readonly MAX_DIRECTORY_DEPTH = 6;

  /** Analisa cada arquivo e retorna somente os problemas encontrados. */
  analyze(files: RepositoryFile[]): AnalyzerResult {
    const findings: Finding[] = [];

    for (const file of files) {
      const pathParts = file.path.split('/').filter(Boolean);
      const directoryDepth = Math.max(0, pathParts.length - 1);

      if (directoryDepth > OrganizationAnalyzer.MAX_DIRECTORY_DEPTH) {
        findings.push({
          category: 'ORGANIZATION',
          severity: 'MEDIUM',
          message: `Caminho possui ${directoryDepth} níveis de pastas; o limite é ${OrganizationAnalyzer.MAX_DIRECTORY_DEPTH}.`,
          file: file.path,
          line: null,
        });
      }

      if (!this.hasValidNames(pathParts)) {
        findings.push({
          category: 'ORGANIZATION',
          severity: 'LOW',
          message:
            'Nome de arquivo ou pasta fora do padrão: use letras minúsculas, números e hífens.',
          file: file.path,
          line: null,
        });
      }
    }

    return {
      category: 'ORGANIZATION',
      score: Math.max(0, 100 - findings.length * 20),
      findings,
    };
  }

  /** Pastas usam kebab-case; arquivos aceitam extensões e nomes convencionais. */
  private hasValidNames(pathParts: string[]): boolean {
    const directoryPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const filePattern = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/;
    const fileName = pathParts.at(-1) ?? '';
    const directories = pathParts.slice(0, -1);

    const validDirectories = directories.every((name) =>
      directoryPattern.test(name),
    );
    const validFileName =
      filePattern.test(fileName) ||
      /^(README|LICENSE|CHANGELOG)(\.[a-z0-9]+)?$/i.test(fileName);

    return validDirectories && validFileName;
  }
}