import { Injectable } from '@nestjs/common';
import type {
  AnalysisCategory,
  Finding,
  Insight,
} from '../analysis/types/analysis.types.js';

const titles: Record<AnalysisCategory, string> = {
  DOCUMENTATION: 'Comece pela documentação',
  TESTS: 'Revise os testes',
  ACCESSIBILITY: 'Melhore a acessibilidade',
  ORGANIZATION: 'Revise a organização',
  MAINTAINABILITY: 'Revise a manutenibilidade',
};

@Injectable()
export class InsightsService {
  // O chamador fornece os findings já ordenados pela prioridade acordada.
  generate(findings: readonly Finding[]): Insight {
    const priorityFinding = findings[0];

    if (!priorityFinding) {
      return {
        // Convenção de apresentação; não representa uma deficiência detectada.
        category: 'DOCUMENTATION',
        title: 'Nenhum risco identificado',
        message:
          'As regras executadas não identificaram findings nesta análise.',
      };
    }

    const location =
      priorityFinding.line === null
        ? priorityFinding.file
        : `${priorityFinding.file}:${priorityFinding.line}`;

    return {
      category: priorityFinding.category,
      title: titles[priorityFinding.category],
      message:
        `${priorityFinding.message} ` +
        `Revise esse apontamento no arquivo ${location}.`,
    };
  }
}
