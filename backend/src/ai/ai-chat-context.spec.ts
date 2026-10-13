import { describe, expect, it } from 'vitest';
import {
  CONSCIOUS_SYSTEM_PROMPT,
  MAX_QUESTION_CHARS,
  buildMessages,
  sanitizeAnalysis,
  sanitizeHistory,
} from './ai-chat-context.js';

describe('sanitizeAnalysis', () => {
  it('retorna estrutura vazia quando a entrada não é objeto', () => {
    expect(sanitizeAnalysis(undefined)).toEqual({
      projectName: '',
      analysisDate: '',
      score: null,
      dimensions: [],
      findings: [],
    });
    expect(sanitizeAnalysis('dados')).toEqual({
      projectName: '',
      analysisDate: '',
      score: null,
      dimensions: [],
      findings: [],
    });
  });

  it('corta e normaliza campos, ignorando valores inválidos', () => {
    const result = sanitizeAnalysis({
      projectName: '  ' + 'p'.repeat(200),
      analysisDate: '2026-10-13',
      score: 250,
      dimensions: [
        { name: 'Testes', score: 88.4 },
        { name: 'x'.repeat(120), score: 'n/a' },
        { name: 'Documentation', score: -3 },
        'inválido',
      ],
      findings: [
        {
          severity: 'critical',
          category: 'c'.repeat(100),
          title: 'T'.repeat(300),
          problem: 'P'.repeat(500),
          whyItMatters: 'W'.repeat(700),
          remediation: 'R'.repeat(700),
          evidence: 'E'.repeat(500),
          occurrences: '3',
          file: 'F'.repeat(400),
          line: '12',
        },
        null,
        [],
      ],
    });

    expect(result.projectName).toBe('p'.repeat(120));
    expect(result.score).toBe(100);
    expect(result.dimensions).toEqual([
      { name: 'Testes', score: 88.4 },
      { name: 'x'.repeat(60), score: null },
      { name: 'Documentation', score: 0 },
    ]);

    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('CRITICAL');
    expect(finding.category).toBe('c'.repeat(60));
    expect(finding.title).toBe('T'.repeat(160));
    expect(finding.problem).toBe('P'.repeat(240));
    expect(finding.whyItMatters).toBe('W'.repeat(320));
    expect(finding.remediation).toBe('R'.repeat(320));
    expect(finding.evidence).toBe('E'.repeat(240));
    expect(finding.occurrences).toBe(1);
    expect(finding.file).toBe('F'.repeat(240));
    expect(finding.line).toBeNull();
  });
});

describe('sanitizeHistory', () => {
  it('mantém somente as seis últimas mensagens com papéis válidos', () => {
    const base = Array.from({ length: 9 }, (_unused, index) => ({
      role: index % 2 ? 'assistant' : 'user',
      content: `mensagem ${index}`,
    }));
    const result = sanitizeHistory([
      { role: 'system', content: 'não pode' },
      { role: 'user', content: '   ' },
      ...base,
      null,
    ]);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ role: 'user', content: 'mensagem 4' });
    expect(result.at(-1)).toEqual({ role: 'user', content: 'mensagem 8' });
  });

  it('trunca o conteúdo de cada mensagem', () => {
    const content = 'x'.repeat(MAX_QUESTION_CHARS + 50);
    const result = sanitizeHistory([{ role: 'user', content }]);
    expect(result[0].content).toBe('x'.repeat(MAX_QUESTION_CHARS));
  });
});

describe('buildMessages', () => {
  it('monta system prompt, histórico e pergunta com o contexto JSON', () => {
    const messages = buildMessages('Como melhorar?', sanitizeAnalysis({ score: 42 }), [
      { role: 'assistant', content: 'oi' },
    ]);

    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({ role: 'system', content: CONSCIOUS_SYSTEM_PROMPT });
    expect(messages[1]).toEqual({ role: 'assistant', content: 'oi' });
    expect(messages[2].role).toBe('user');
    expect(messages[2].content).toContain('"score":42');
    expect(messages[2].content.startsWith('ANÁLISE OBJETIVA (JSON):')).toBe(true);
    expect(messages[2].content.endsWith('\nPERGUNTA:\nComo melhorar?')).toBe(true);
  });
});
