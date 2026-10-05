import type { AnalysisResult } from './analysis-result.model';

const categories = ['DOCUMENTATION', 'TESTS', 'ACCESSIBILITY', 'ORGANIZATION', 'MAINTAINABILITY'];
const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const score = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
const category = (value: unknown) => typeof value === 'string' && categories.includes(value);

export function isAnalysisResult(value: unknown, projectId: string): value is AnalysisResult {
  if (
    !object(value) ||
    value['projectId'] !== projectId ||
    !text(value['analyzedAt']) ||
    !Number.isFinite(Date.parse(value['analyzedAt'])) ||
    (value['demoMode'] !== undefined && typeof value['demoMode'] !== 'boolean') ||
    !Array.isArray(value['dimensions']) ||
    !Array.isArray(value['findings'])
  )
    return false;
  if (value['status'] === 'FAILED') {
    return (
      value['score'] === null &&
      value['dimensions'].length === 0 &&
      value['findings'].length === 0 &&
      value['insight'] === null &&
      object(value['error']) &&
      text(value['error']['code']) &&
      text(value['error']['message'])
    );
  }
  return (
    value['status'] === 'COMPLETED' &&
    value['error'] === undefined &&
    score(value['score']) &&
    value['dimensions'].length === 5 &&
    value['dimensions'].every((d) => object(d) && category(d['category']) && score(d['score'])) &&
    new Set(value['dimensions'].map((d) => d.category)).size === 5 &&
    value['findings'].every(
      (f) =>
        object(f) &&
        category(f['category']) &&
        typeof f['severity'] === 'string' &&
        severities.includes(f['severity']) &&
        text(f['message']) &&
        text(f['file']) &&
        (f['line'] === null ||
          (typeof f['line'] === 'number' && Number.isSafeInteger(f['line']) && f['line'] > 0)),
    ) &&
    object(value['insight']) &&
    category(value['insight']['category']) &&
    text(value['insight']['title']) &&
    text(value['insight']['message'])
  );
}
