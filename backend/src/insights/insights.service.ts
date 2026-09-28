import { Injectable } from '@nestjs/common';
import { validateInsightInputs } from '../analysis/analysis-result.validator.js';
import type {
  AnalysisCategory,
  DimensionScore,
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

// Esta ordem serve apenas à apresentação dos empates; não ordena riscos.
const labels: Record<AnalysisCategory, string> = {
  DOCUMENTATION: 'Documentação',
  TESTS: 'Testes',
  ACCESSIBILITY: 'Acessibilidade',
  ORGANIZATION: 'Organização',
  MAINTAINABILITY: 'Manutenibilidade',
};

@Injectable()
export class InsightsService {
  // O chamador fornece os findings já ordenados pela prioridade acordada.
  generate(
    dimensions: readonly DimensionScore[],
    orderedFindings: readonly Finding[],
  ): Insight {
    validateInsightInputs(dimensions, orderedFindings);
    const priorityFinding = orderedFindings[0];

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

    const lowestScore = Math.min(
      ...dimensions.map((dimension) => dimension.score),
    );
    const worstCategories = new Set(
      dimensions
        .filter((dimension) => dimension.score === lowestScore)
        .map((dimension) => dimension.category),
    );
    const worstLabels = (Object.keys(labels) as AnalysisCategory[])
      .filter((category) => worstCategories.has(category))
      .map((category) => labels[category]);
    const context =
      worstLabels.length === 1
        ? `${worstLabels[0]} apresentou a menor nota: ${lowestScore}/100.`
        : `${worstLabels.slice(0, -1).join(', ')} e ${worstLabels.at(-1)} apresentaram a menor nota: ${lowestScore}/100.`;

    return {
      category: priorityFinding.category,
      title: titles[priorityFinding.category],
      message:
        `${context} Como primeira ação, revise o apontamento de ${labels[priorityFinding.category].toLowerCase()}: ${priorityFinding.message} ` +
        `Revise esse apontamento no arquivo ${location}.`,
    };
  }
}
