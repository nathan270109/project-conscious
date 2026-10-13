import { Injectable } from '@nestjs/common';
import ts from 'typescript';
import type { RepositoryFile } from '../../github/github.service.js';
import { aggregateFindings, createFinding, evidenceAt } from '../finding.utils.js';
import { isTestFile, type RepositoryProfile } from '../repository-profiler.service.js';
import type { AnalyzerResult, Finding, Severity } from '../types/analysis.types.js';
import type { Analyzer } from './analyzer.interface.js';

@Injectable()
export class MaintainabilityAnalyzer implements Analyzer {
  private static readonly MAX_FILE_LINES = 400;
  private static readonly MAX_FUNCTION_LINES = 80;
  private static readonly MAX_COMPLEXITY = 10;
  private static readonly MAX_NESTING = 4;
  private static readonly MAX_PARAMETERS = 5;

  analyze(_files: RepositoryFile[], profile: RepositoryProfile): AnalyzerResult {
    const findings = profile.sourceFiles.flatMap((file) => this.analyzeFile(file));
    return { category: 'MAINTAINABILITY', analyzedItems: profile.sourceFiles.length,
      findings: aggregateFindings(findings) };
  }

  private analyzeFile(file: RepositoryFile): Finding[] {
    const content = file.content ?? '';
    const findings: Finding[] = [];
    const lineCount = content.split(/\r?\n/).length;
    if (lineCount > MaintainabilityAnalyzer.MAX_FILE_LINES) findings.push(this.finding(
      'MAINT004', 'MEDIUM', 'Arquivo grande demais para revisão simples',
      `O arquivo possui ${lineCount} linhas; a referência adotada é ${MaintainabilityAnalyzer.MAX_FILE_LINES}.`,
      'Arquivos grandes concentram responsabilidades e elevam o custo de revisão e teste.',
      'Separe responsabilidades coesas em módulos menores antes de adicionar novos comportamentos.',
      file.path, null, null,
    ));
    const source = ts.createSourceFile(file.path, content, ts.ScriptTarget.Latest, true,
      /\.tsx$/i.test(file.path) ? ts.ScriptKind.TSX : /\.jsx$/i.test(file.path) ? ts.ScriptKind.JSX : ts.ScriptKind.TS);
    let anyCount = 0;
    const visit = (node: ts.Node, nesting = 0): void => {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      if (!isTestFile(file.path) && ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(source) === 'console' &&
        node.expression.name.text === 'log') findings.push(this.finding(
          'MAINT001', 'LOW', 'Log de depuração em código de produção',
          'Uma chamada console.log foi encontrada fora de arquivo de teste.',
          'Logs não estruturados podem poluir a saída, expor dados e dificultar observabilidade.',
          'Remova o log ou use o mecanismo estruturado e configurável do projeto.',
          file.path, line, evidenceAt(content, line),
        ));
      if (ts.isCatchClause(node) && node.block.statements.length === 0) findings.push(this.finding(
        'MAINT002', 'HIGH', 'Erro capturado e descartado silenciosamente',
        'Um bloco catch vazio impede registro, recuperação ou propagação da falha.',
        'Falhas reais podem desaparecer e tornar incidentes difíceis de diagnosticar.',
        'Trate o erro, registre contexto seguro ou propague-o para uma camada responsável.',
        file.path, line, evidenceAt(content, line),
      ));
      if (node.kind === ts.SyntaxKind.AnyKeyword) anyCount++;
      if (this.isFunction(node)) this.inspectFunction(node, source, content, file.path, findings);
      const control = this.isControl(node);
      if (control && nesting + 1 > MaintainabilityAnalyzer.MAX_NESTING) findings.push(this.finding(
        'MAINT007', 'MEDIUM', 'Aninhamento elevado dificulta o fluxo',
        `O fluxo alcança ${nesting + 1} níveis de aninhamento.`,
        'Muitos níveis aumentam a carga cognitiva e escondem caminhos de erro.',
        'Use retornos antecipados e extraia decisões em funções menores.',
        file.path, line, evidenceAt(content, line),
      ));
      node.forEachChild((child) => visit(child, control ? nesting + 1 : nesting));
    };
    visit(source);
    if (anyCount >= 3) findings.push(this.finding(
      'MAINT003', 'MEDIUM', 'Uso repetido de any reduz segurança de tipos',
      `Foram encontrados ${anyCount} usos do tipo any no arquivo.`,
      'Contratos permissivos ocultam incompatibilidades que apareceriam durante o build.',
      'Modele tipos específicos ou use unknown com validação explícita nos limites.',
      file.path, null, null, anyCount,
    ));
    return findings;
  }

  private inspectFunction(node: ts.FunctionLikeDeclaration, source: ts.SourceFile,
    content: string, file: string, findings: Finding[]): void {
    const start = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    const end = source.getLineAndCharacterOfPosition(node.end).line + 1;
    const lines = end - start + 1;
    const name = 'name' in node && node.name ? node.name.getText(source) : 'Função anônima';
    if (lines > MaintainabilityAnalyzer.MAX_FUNCTION_LINES) findings.push(this.finding(
      'MAINT005', 'MEDIUM', 'Função concentra comportamento demais',
      `${name} possui ${lines} linhas; a referência adotada é ${MaintainabilityAnalyzer.MAX_FUNCTION_LINES}.`,
      'Funções extensas dificultam entendimento, testes isolados e mudanças seguras.',
      'Extraia etapas coesas e mantenha a função principal como orquestradora.', file, start, evidenceAt(content, start)));
    let complexity = 1;
    const count = (child: ts.Node): void => {
      if (ts.isIfStatement(child) || ts.isForStatement(child) || ts.isForInStatement(child) ||
        ts.isForOfStatement(child) || ts.isWhileStatement(child) || ts.isDoStatement(child) ||
        ts.isConditionalExpression(child) || ts.isCaseClause(child) ||
        (ts.isBinaryExpression(child) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken]
          .includes(child.operatorToken.kind))) complexity++;
      child.forEachChild(count);
    };
    node.forEachChild(count);
    if (complexity > MaintainabilityAnalyzer.MAX_COMPLEXITY) findings.push(this.finding(
      'MAINT006', 'HIGH', 'Complexidade elevada na função',
      `${name} possui complexidade estimada em ${complexity}; a referência adotada é ${MaintainabilityAnalyzer.MAX_COMPLEXITY}.`,
      'Muitos caminhos independentes ampliam o esforço de teste e a chance de regressão.',
      'Divida regras de decisão e cubra cada caminho relevante com testes.', file, start, evidenceAt(content, start)));
    if (node.parameters.length > MaintainabilityAnalyzer.MAX_PARAMETERS) findings.push(this.finding(
      'MAINT008', 'MEDIUM', 'Função recebe parâmetros demais',
      `${name} recebe ${node.parameters.length} parâmetros; a referência adotada é ${MaintainabilityAnalyzer.MAX_PARAMETERS}.`,
      'Listas longas de argumentos tornam chamadas frágeis e difíceis de interpretar.',
      'Agrupe parâmetros relacionados em um objeto tipado ou reduza responsabilidades.', file, start, evidenceAt(content, start)));
  }

  private isFunction(node: ts.Node): node is ts.FunctionLikeDeclaration {
    return ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node);
  }
  private isControl(node: ts.Node): boolean {
    return ts.isIfStatement(node) || ts.isForStatement(node) || ts.isForInStatement(node) ||
      ts.isForOfStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isSwitchStatement(node);
  }
  private finding(ruleId: string, severity: Severity, title: string, message: string,
    whyItMatters: string, remediation: string, file: string, line: number | null,
    evidence: string | null, occurrences = 1): Finding {
    return createFinding({ ruleId, category: 'MAINTAINABILITY', severity, title, message,
      whyItMatters, remediation, evidence, file, line, occurrences });
  }
}
