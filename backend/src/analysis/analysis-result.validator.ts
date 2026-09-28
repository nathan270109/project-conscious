import { InternalServerErrorException } from '@nestjs/common';
import type { AnalysisEngineOutput } from './analysis-engine.interface.js';

const categories = [
  'DOCUMENTATION',
  'TESTS',
  'ACCESSIBILITY',
  'ORGANIZATION',
  'MAINTAINABILITY',
] as const;
const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isCategory(value: unknown): boolean {
  return categories.some((category) => category === value);
}

function isScore(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

function isFinding(value: unknown): boolean {
  return (
    isRecord(value) &&
    isCategory(value.category) &&
    severities.some((severity) => severity === value.severity) &&
    isText(value.message) &&
    isText(value.file) &&
    (value.line === null ||
      (typeof value.line === 'number' &&
        Number.isSafeInteger(value.line) &&
        value.line > 0))
  );
}

function isDimensions(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === categories.length &&
    categories.every((category) =>
      value.some(
        (dimension: unknown) =>
          isRecord(dimension) &&
          dimension.category === category &&
          isScore(dimension.score),
      ),
    )
  );
}

export function validateAnalysisResult(
  result: unknown,
): asserts result is AnalysisEngineOutput {
  const valid =
    isRecord(result) &&
    isScore(result.score) &&
    isDimensions(result.dimensions) &&
    Array.isArray(result.findings) &&
    Array.from(result.findings).every(isFinding) &&
    isRecord(result.insight) &&
    isCategory(result.insight.category) &&
    isText(result.insight.title) &&
    isText(result.insight.message);

  if (!valid) {
    throw new InternalServerErrorException(
      'O motor retornou um resultado de análise inválido.',
    );
  }
}

export function validateInsightInputs(
  dimensions: unknown,
  findings: unknown,
): void {
  if (
    !isDimensions(dimensions) ||
    !Array.isArray(findings) ||
    !Array.from(findings).every(isFinding)
  ) {
    throw new InternalServerErrorException(
      'Entradas inválidas para geração do insight.',
    );
  }
}
