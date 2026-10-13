import type { Finding } from './types/analysis.types.js';

export function createFinding(
  finding: Omit<Finding, 'occurrences'> & { occurrences?: number },
): Finding {
  return { ...finding, occurrences: finding.occurrences ?? 1 };
}

export function aggregateFindings(findings: readonly Finding[]): Finding[] {
  const grouped = new Map<string, Finding>();
  for (const finding of findings) {
    const key = `${finding.ruleId}\0${finding.file}`;
    const current = grouped.get(key);
    if (current) current.occurrences += finding.occurrences;
    else grouped.set(key, { ...finding });
  }
  return [...grouped.values()];
}

export function evidenceAt(content: string, line: number): string | null {
  const value = content.split(/\r?\n/)[line - 1]?.trim().replace(/\s+/g, ' ');
  return value ? value.slice(0, 240) : null;
}
