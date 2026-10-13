import type { RepositoryFile } from '../../github/github.service.js';
import { RepositoryProfiler } from '../repository-profiler.service.js';
import { TestsAnalyzer } from './tests.analyzer.js';

describe('TestsAnalyzer', () => {
  const analyzer = new TestsAnalyzer();
  const profiler = new RepositoryProfiler();
  const analyze = (files: RepositoryFile[]) => analyzer.analyze(files, profiler.profile(files));

  it('accepts an executable suite with assertions', () => {
    const files = [{ path: 'package.json', content: '{"scripts":{"test":"vitest"}}' },
      { path: 'src/app.ts', content: 'export const value=1' },
      { path: 'src/app.spec.ts', content: 'test("value",()=>expect(1).toBe(1))' }];
    expect(analyze(files).findings).toEqual([]);
  });

  it('does not award a clean result for a test-shaped empty file', () => {
    const files = [{ path: 'package.json', content: '{"scripts":{"test":"vitest"}}' },
      { path: 'src/app.spec.ts', content: 'describe("app",()=>{})' }];
    expect(analyze(files).findings[0].ruleId).toBe('TEST003');
  });

  it('detects missing tests, missing assertions, focused and skipped tests', () => {
    expect(analyze([{ path: 'src/app.ts', content: '' }]).findings.map((f) => f.ruleId))
      .toEqual(['TEST002']);
    const files = [{ path: 'package.json', content: '{"scripts":{"test":"vitest"}}' },
      { path: 'src/app.spec.ts', content: 'test.only("a",()=>{}); test.skip("b",()=>{})' }];
    expect(analyze(files).findings.map((f) => f.ruleId)).toEqual(['TEST004', 'TEST005', 'TEST006']);
  });
});
