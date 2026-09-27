import { InternalServerErrorException } from '@nestjs/common';
import type { AnalysisEngineOutput } from '../analysis/analysis-engine.interface.js';
import type { AnalysisCategory } from './types/analysis.types.js';

const categories: readonly AnalysisCategory[] = [
  'DOCUMENTATION',
  'TESTS',
  'ACCESSIBILITY',
  'ORGANIZATION',
  'MAINTAINABILITY',
];

function isValidScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function validateAnalysisResult(
  result: AnalysisEngineOutput,
): void {
  const dimensionCategories = new Set(
    result.dimensions.map((dimension) => dimension.category),
  );

  const hasAllDimensions =
    result.dimensions.length === categories.length &&
    dimensionCategories.size === categories.length &&
    categories.every((category) => dimensionCategories.has(category));

  const hasValidScores =
    isValidScore(result.score) &&
    result.dimensions.every((dimension) =>
      isValidScore(dimension.score),
    );

  if (!hasAllDimensions || !hasValidScores) {
    throw new InternalServerErrorException(
      'O motor retornou um resultado de análise inválido.',
    );
  }
}