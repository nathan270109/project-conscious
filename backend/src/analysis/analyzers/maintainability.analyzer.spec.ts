import type { RepositoryFile } from '../../github/github.service.js';
import { RepositoryProfiler } from '../repository-profiler.service.js';
import { MaintainabilityAnalyzer } from './maintainability.analyzer.js';

describe('MaintainabilityAnalyzer', () => {
  const analyzer = new MaintainabilityAnalyzer();
  const profiler = new RepositoryProfiler();
  const analyze = (files: RepositoryFile[]) => analyzer.analyze(files, profiler.profile(files));

  it('uses the TypeScript AST for actionable findings', () => {
    const result = analyze([{ path: 'src/app.ts', content:
      'function run(a:any,b:any,c:any,d:any,e:any,f:any){ console.log(a); try{x()}catch(e){} }' }]);
    expect(result.findings.map((finding) => finding.ruleId)).toEqual(
      expect.arrayContaining(['MAINT001', 'MAINT002', 'MAINT003', 'MAINT008']));
    expect(result.findings.find((finding) => finding.ruleId === 'MAINT001')?.evidence).toContain('console.log');
  });

  it('ignores console.log in test files and reports large files', () => {
    expect(analyze([{ path: 'src/app.spec.ts', content: 'console.log("test")' }]).findings).toEqual([]);
    const large = analyze([{ path: 'src/large.ts', content: Array(401).fill('const value = 1;').join('\n') }]);
    expect(large.findings[0].ruleId).toBe('MAINT004');
  });
});
