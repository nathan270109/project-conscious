import type { RepositoryFile } from '../../github/github.service.js';
import { RepositoryProfiler } from '../repository-profiler.service.js';
import { AccessibilityAnalyzer } from './accessibility.analyzer.js';

describe('AccessibilityAnalyzer', () => {
  const analyzer = new AccessibilityAnalyzer();
  const profiler = new RepositoryProfiler();
  const analyze = (files: RepositoryFile[]) => analyzer.analyze(files, profiler.profile(files));

  it('recognizes valid accessible-name strategies', () => {
    const result = analyze([{ path: 'src/app.html', content:
      '<label>Email <input type="email"></label><input type="hidden"><input aria-label="Busca">' +
      '<button aria-label="Fechar"><span>×</span></button><a href="/docs">Documentação</a>' +
      '<div role="button" tabindex="0" (click)="save()" (keydown)="save()">Salvar</div>' }]);
    expect(result.findings).toEqual([]);
  });

  it('returns actionable findings and omits reference and confidence', () => {
    const result = analyze([{ path: 'src/app.html',
      content: '<img src="hero.png">\n<input type="email">\n<button></button>\n<a href="/x"></a>' }]);
    expect(result.findings.map((finding) => finding.ruleId)).toEqual([
      'A11Y001', 'A11Y002', 'A11Y003', 'A11Y004',
    ]);
    expect(result.findings[0]).toMatchObject({ evidence: '<img src="hero.png">', line: 1,
      whyItMatters: expect.any(String), remediation: expect.any(String) });
    expect(result.findings[0]).not.toHaveProperty('reference');
    expect(result.findings[0]).not.toHaveProperty('confidence');
  });

  it('aggregates repeated violations and detects missing document language', () => {
    const repeated = analyze([{ path: 'src/gallery.html', content: '<img src="a"><img src="b">' }]);
    expect(repeated.findings[0]).toMatchObject({ ruleId: 'A11Y001', occurrences: 2 });
    const document = analyze([{ path: 'index.html',
      content: '<!doctype html><html><body><main>Conteúdo</main></body></html>' }]);
    expect(document.findings).toEqual([expect.objectContaining({ ruleId: 'A11Y006' })]);
  });

  it('reports a coverage gap for a frontend without external HTML', () => {
    const files = [{ path: 'package.json', content: '{"dependencies":{"react":"1"}}' },
      { path: 'src/App.tsx', content: 'export const App = () => <main />' }];
    expect(analyze(files).findings[0].ruleId).toBe('A11Y000');
  });
});
