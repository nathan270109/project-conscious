import { Injectable } from '@nestjs/common';
import { RepositoryFile } from '../../github/github.service.js';
import { Analyzer } from './analyzer.interface.js';
import { AnalyzerResult, Finding } from '../types/analysis.types.js';

@Injectable()
export class DocumentationAnalyzer implements Analyzer {
  analyze(files: RepositoryFile[]): AnalyzerResult {
    const readme = files.find((file) => this.isReadme(file.path));

    if (!readme) {
      return {
        category: 'DOCUMENTATION',
        score: 0,
        findings: [
          {
            category: 'DOCUMENTATION',
            severity: 'HIGH',
            message: 'README não encontrado no repositório.',
            file: 'README',
            line: null,
          },
        ],
      };
    }

    const content = readme.content ?? '';
    const findings: Finding[] = [];

    const hasDescription = /(sobre|descri[cç][aã]o|about|description)/i.test(
      content,
    );

    const hasInstallation =
      /(instala[cç][aã]o|installation|instalar|npm install|pnpm install|yarn install)/i.test(
        content,
      );

    const hasExecution =
      /(como executar|execu[cç][aã]o|usage|npm run|npm start|pnpm start|yarn start)/i.test(
        content,
      );

    if (!hasDescription) {
      findings.push({
        category: 'DOCUMENTATION',
        severity: 'MEDIUM',
        message: 'README não possui uma descrição do projeto.',
        file: readme.path,
        line: null,
      });
    }

    if (!hasInstallation) {
      findings.push({
        category: 'DOCUMENTATION',
        severity: 'MEDIUM',
        message: 'README não possui instruções de instalação.',
        file: readme.path,
        line: null,
      });
    }

    if (!hasExecution) {
      findings.push({
        category: 'DOCUMENTATION',
        severity: 'MEDIUM',
        message: 'README não possui instruções de execução.',
        file: readme.path,
        line: null,
      });
    }

    return {
      category: 'DOCUMENTATION',
      score: Math.max(0, 100 - findings.length * 30),
      findings,
    };
  }

  private isReadme(path: string): boolean {
    const fileName = path.toLowerCase().split('/').pop() ?? '';

    return fileName === 'readme' || fileName.startsWith('readme.');
  }
}