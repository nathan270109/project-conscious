import { Injectable } from '@nestjs/common';
import type { RepositoryFile } from '../../github/github.service.js';
import { aggregateFindings, createFinding } from '../finding.utils.js';
import type { RepositoryProfile } from '../repository-profiler.service.js';
import type { AnalyzerResult, Finding, Severity } from '../types/analysis.types.js';
import type { Analyzer } from './analyzer.interface.js';

@Injectable()
export class DocumentationAnalyzer implements Analyzer {
  analyze(files: RepositoryFile[], profile: RepositoryProfile): AnalyzerResult {
    const readme = this.rootReadme(files);
    if (!readme) {
      return {
        category: 'DOCUMENTATION',
        analyzedItems: 0,
        findings: [this.finding(
          'DOC001', 'HIGH', 'README principal não encontrado',
          'Não foi encontrado um README na raiz do repositório.',
          'Sem uma entrada principal, instalação, execução e limites do projeto ficam implícitos.',
          'Crie README.md na raiz com objetivo, pré-requisitos, instalação, execução e testes.',
          'README.md', null,
        )],
      };
    }

    const content = readme.content ?? '';
    const findings: Finding[] = [];
    const intro = content
      .replace(/^#.*$/m, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#>*_`\-[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (intro.length < 80) findings.push(this.finding(
      'DOC002', 'MEDIUM', 'Objetivo do projeto pouco explicado',
      'O README não contém uma apresentação substantiva do problema e da solução.',
      'Novos contribuidores não conseguem confirmar rapidamente o propósito e o escopo do projeto.',
      'Inclua após o título um parágrafo com objetivo, público, principais capacidades e limites.',
      readme.path, null,
    ));

    const commands = [...content.matchAll(/(?:^|\n)\s*(?:```[^\n]*\n)?\s*((?:npm|pnpm|yarn)\s+(?:install|i|run\s+[\w:-]+|start|test)[^\n`]*)/gi)]
      .map((match) => match[1].trim());
    const hasInstall = commands.some((command) => /\b(install|\si)\b/i.test(command));
    const hasRun = commands.some((command) => /\b(run\s+\w+|start)\b/i.test(command));
    const hasTests = commands.some((command) => /\btest\b/i.test(command));
    if (!hasInstall) findings.push(this.finding(
      'DOC003', 'MEDIUM', 'Instalação não reproduzível pelo README',
      'Não foi encontrada uma seção de instalação com ao menos um comando executável.',
      'A ausência de passos reproduzíveis aumenta falhas de onboarding e diferenças entre ambientes.',
      `Documente pré-requisitos e o comando de instalação${profile.packageManager === 'unknown' ? ' do gerenciador usado pelo projeto' : ` do ${profile.packageManager}`}.`,
      readme.path, null,
    ));
    if (!hasRun) findings.push(this.finding(
      'DOC004', 'MEDIUM', 'Execução local não está demonstrada',
      'O README não apresenta uma seção de execução com comando verificável.',
      'Mesmo com dependências instaladas, o usuário não sabe como iniciar ou validar a aplicação.',
      'Inclua o comando real de inicialização e descreva portas, serviços dependentes e resultado esperado.',
      readme.path, null,
    ));
    if (profile.testFiles.length > 0 && !hasTests) findings.push(this.finding(
      'DOC005', 'LOW', 'Testes existem, mas não estão documentados',
      `Foram detectados ${profile.testFiles.length} arquivos de teste sem comando de teste no README.`,
      'Contribuidores podem enviar mudanças sem executar a suíte disponível.',
      'Documente o comando de testes e qualquer preparação necessária.',
      readme.path, null,
    ));

    for (const command of commands) {
      const script = command.match(/^(?:npm|pnpm|yarn)\s+run\s+([\w:-]+)/i)?.[1];
      if (script && !profile.scripts.has(script)) findings.push(this.finding(
        'DOC006', 'HIGH', 'Comando documentado não existe no projeto',
        `O README orienta executar “${command}”, mas o script “${script}” não existe no package.json.`,
        'A documentação leva a uma falha imediata e reduz a confiança no onboarding.',
        `Corrija o comando ou adicione o script “${script}” ao package.json.`,
        readme.path, this.lineOf(content, command),
      ));
    }

    return { category: 'DOCUMENTATION', analyzedItems: 1, findings: aggregateFindings(findings) };
  }

  private rootReadme(files: RepositoryFile[]): RepositoryFile | undefined {
    return files
      .filter((file) => /(^|\/)readme(?:\.[^/]+)?$/i.test(file.path))
      .sort((a, b) => a.path.split('/').length - b.path.split('/').length)[0];
  }

  private lineOf(content: string, value: string): number | null {
    const index = content.indexOf(value);
    return index < 0 ? null : content.slice(0, index).split(/\r?\n/).length;
  }

  private finding(ruleId: string, severity: Severity, title: string, message: string,
    whyItMatters: string, remediation: string, file: string, line: number | null): Finding {
    return createFinding({ ruleId, category: 'DOCUMENTATION', severity, title, message,
      whyItMatters, remediation, evidence: null, file, line });
  }
}
