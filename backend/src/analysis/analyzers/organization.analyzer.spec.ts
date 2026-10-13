import type { RepositoryFile } from '../../github/github.service.js';
import { RepositoryProfiler } from '../repository-profiler.service.js';
import { OrganizationAnalyzer } from './organization.analyzer.js';

describe('OrganizationAnalyzer', () => {
  const analyzer = new OrganizationAnalyzer();
  const profiler = new RepositoryProfiler();
  const analyze = (files: RepositoryFile[]) => analyzer.analyze(files, profiler.profile(files));

  it('uses framework-aware file conventions', () => {
    const react = [{ path: 'package.json', content: '{"dependencies":{"react":"1"}}' },
      { path: 'src/UserCard.tsx', content: '' }];
    expect(analyze(react).findings).toEqual([]);
    expect(analyze([{ path: 'src/Bad_Name.ts', content: '' }]).findings[0].ruleId).toBe('ORG002');
  });

  it('detects excessive depth and missing CI in larger projects', () => {
    const deep = analyze([{ path: 'a/b/c/d/e/f/g/h/i/file.ts', content: '' }]);
    expect(deep.findings[0].ruleId).toBe('ORG001');
    const many = Array.from({ length: 12 }, (_, index) => ({ path: `src/file-${index}.ts`, content: '' }));
    expect(analyze(many).findings.some((finding) => finding.ruleId === 'ORG003')).toBe(true);
  });
});
