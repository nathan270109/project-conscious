import { Injectable } from '@nestjs/common';
import type { RepositoryFile } from '../../github/github.service.js';
import { aggregateFindings, createFinding, evidenceAt } from '../finding.utils.js';
import type { RepositoryProfile } from '../repository-profiler.service.js';
import type { AnalyzerResult, Finding, Severity } from '../types/analysis.types.js';
import type { Analyzer } from './analyzer.interface.js';

@Injectable()
export class TestsAnalyzer implements Analyzer {
  analyze(_files: RepositoryFile[], profile: RepositoryProfile): AnalyzerResult {
    const findings: Finding[] = [];
    const testFiles = profile.testFiles;
    if (profile.framework !== 'unknown' && !profile.scripts.has('test')) findings.push(this.finding(
      'TEST001', 'HIGH', 'Script de testes não configurado',
      'O package.json não oferece um script “test” executável.',
      'A suíte não possui uma interface consistente para execução local e em CI.',
      'Adicione um script test que execute a suíte em modo não interativo.',
      'package.json', null, null,
    ));
    if (testFiles.length === 0) findings.push(this.finding(
      'TEST002', 'HIGH', 'Código-fonte sem testes detectáveis',
      `Foram encontrados ${profile.sourceFiles.length} arquivos de código e nenhum arquivo de teste reconhecido.`,
      'Mudanças podem introduzir regressões sem uma verificação automatizada próxima ao comportamento alterado.',
      'Adicione testes unitários para os fluxos centrais e um script de execução no package.json.',
      'tests', null, null,
    ));

    for (const file of testFiles) {
      const content = file.content ?? '';
      const cases = [...content.matchAll(/\b(?:it|test)(?:\.(?:only|skip))?\s*\(/g)];
      const assertions = [...content.matchAll(/\b(?:expect\s*\(|assert\s*[.(])/g)];
      if (cases.length === 0) findings.push(this.finding(
        'TEST003', 'MEDIUM', 'Arquivo de teste sem casos executáveis',
        'O arquivo tem nome de teste, mas não contém chamadas it(...) ou test(...).',
        'O arquivo pode criar uma falsa percepção de cobertura sem validar comportamento.',
        'Adicione casos executáveis ou remova/renomeie o arquivo se não for uma suíte.',
        file.path, null, null,
      ));
      else if (assertions.length === 0) findings.push(this.finding(
        'TEST004', 'HIGH', 'Casos de teste sem asserções detectáveis',
        `Foram encontrados ${cases.length} casos, mas nenhuma asserção reconhecida.`,
        'Testes sem verificação explícita podem passar sem confirmar o resultado esperado.',
        'Adicione expect/assert para os comportamentos e efeitos relevantes.',
        file.path, null, null,
      ));
      for (const match of content.matchAll(/\b(?:describe|it|test)\.only\s*\(/g)) {
        const line = content.slice(0, match.index).split(/\r?\n/).length;
        findings.push(this.finding('TEST005', 'HIGH', 'Teste focado pode ocultar a suíte',
          'Uma chamada .only faz o runner ignorar os demais testes.',
          'CI pode ficar verde executando apenas uma fração da suíte.',
          'Remova .only antes de integrar a alteração.', file.path, line, evidenceAt(content, line)));
      }
      for (const match of content.matchAll(/\b(?:describe|it|test)\.skip\s*\(/g)) {
        const line = content.slice(0, match.index).split(/\r?\n/).length;
        findings.push(this.finding('TEST006', 'LOW', 'Teste ignorado na suíte',
          'Uma chamada .skip desativa um teste.',
          'Comportamentos importantes podem ficar sem proteção por tempo indefinido.',
          'Reative o teste ou registre uma justificativa e prazo para correção.', file.path, line, evidenceAt(content, line)));
      }
    }

    if (profile.sourceFiles.length >= 8 && testFiles.length > 0 && profile.sourceFiles.length / testFiles.length > 8) {
      findings.push(this.finding('TEST007', 'MEDIUM', 'Distribuição de testes muito baixa',
        `Há ${profile.sourceFiles.length} arquivos de código para ${testFiles.length} arquivo(s) de teste.`,
        'Uma suíte muito concentrada tende a deixar módulos e caminhos críticos sem proteção.',
        'Priorize testes nos módulos com maior risco e acompanhe cobertura por arquivo.', 'tests', null, null));
    }
    return { category: 'TESTS', analyzedItems: testFiles.length, findings: aggregateFindings(findings) };
  }

  private finding(ruleId: string, severity: Severity, title: string, message: string,
    whyItMatters: string, remediation: string, file: string, line: number | null,
    evidence: string | null): Finding {
    return createFinding({ ruleId, category: 'TESTS', severity, title, message,
      whyItMatters, remediation, evidence, file, line });
  }
}
