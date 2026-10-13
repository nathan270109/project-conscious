import { Injectable } from '@nestjs/common';
import type { RepositoryFile } from '../../github/github.service.js';
import { aggregateFindings, createFinding } from '../finding.utils.js';
import type { RepositoryProfile } from '../repository-profiler.service.js';
import type { AnalyzerResult, Finding, Severity } from '../types/analysis.types.js';
import type { Analyzer } from './analyzer.interface.js';

@Injectable()
export class OrganizationAnalyzer implements Analyzer {
  private static readonly MAX_DIRECTORY_DEPTH = 8;

  analyze(files: RepositoryFile[], profile: RepositoryProfile): AnalyzerResult {
    const findings: Finding[] = [];
    for (const file of files) {
      const parts = file.path.split('/').filter(Boolean);
      const depth = Math.max(0, parts.length - 1);
      if (depth > OrganizationAnalyzer.MAX_DIRECTORY_DEPTH) findings.push(this.finding(
        'ORG001', 'MEDIUM', 'Caminho excessivamente profundo',
        `O arquivo está em ${depth} níveis de pastas; a referência adotada é ${OrganizationAnalyzer.MAX_DIRECTORY_DEPTH}.`,
        'Estruturas profundas aumentam custo de navegação, imports e descoberta de responsabilidades.',
        'Reavalie agrupamentos intermediários e mantenha módulos próximos do domínio que representam.',
        file.path,
      ));
      if (!this.validFileName(parts.at(-1) ?? '', profile.framework)) findings.push(this.finding(
        'ORG002', 'LOW', 'Nome de arquivo diverge da convenção detectada',
        'O nome não segue a convenção esperada para o projeto.',
        'Convenções inconsistentes tornam buscas, imports e localização de responsabilidades menos previsíveis.',
        'Renomeie o arquivo seguindo a convenção do framework ou documente a exceção arquitetural.',
        file.path,
      ));
    }
    if (profile.sourceFiles.length >= 12 && !profile.hasCi) findings.push(this.finding(
      'ORG003', 'MEDIUM', 'Automação de integração contínua não detectada',
      `O projeto possui ${profile.sourceFiles.length} arquivos de código, mas nenhuma configuração de CI reconhecida.`,
      'Sem verificação automática, lint, testes e build podem divergir entre contribuições.',
      'Adicione um workflow que instale dependências e execute lint, testes e build.',
      '.github/workflows',
    ));
    return { category: 'ORGANIZATION', analyzedItems: files.length,
      findings: aggregateFindings(findings) };
  }

  private validFileName(name: string, framework: RepositoryProfile['framework']): boolean {
    if (/^(README|LICENSE|CHANGELOG|Dockerfile)(\.[a-z0-9]+)?$/i.test(name)) return true;
    if (/^(package|tsconfig|angular)(\.[a-z0-9-]+)*\.json$/i.test(name)) return true;
    if (/^\.[a-z0-9._-]+$/i.test(name)) return true;
    if (framework === 'react' && /^[A-Z][A-Za-z0-9]*(?:\.(?:test|spec))?\.[cm]?[jt]sx?$/.test(name)) return true;
    return /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(name);
  }

  private finding(ruleId: string, severity: Severity, title: string, message: string,
    whyItMatters: string, remediation: string, file: string): Finding {
    return createFinding({ ruleId, category: 'ORGANIZATION', severity, title, message,
      whyItMatters, remediation, evidence: null, file, line: null });
  }
}
