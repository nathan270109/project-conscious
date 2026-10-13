import { RepositoryProfiler } from './repository-profiler.service.js';

describe('RepositoryProfiler', () => {
  const profiler = new RepositoryProfiler();

  it('detects framework, package manager, scripts, tests and CI once', () => {
    const profile = profiler.profile([
      { path: 'package.json', content: '{"packageManager":"npm@11","dependencies":{"@angular/core":"22"},"scripts":{"test":"vitest"}}' },
      { path: 'src/app.ts', content: '' },
      { path: 'src/app.spec.ts', content: '' },
      { path: '.github/workflows/ci.yml', content: '' },
    ]);
    expect(profile).toMatchObject({ framework: 'angular', packageManager: 'npm',
      hasFrontend: true, hasCi: true });
    expect(profile.scripts.has('test')).toBe(true);
    expect(profile.sourceFiles).toHaveLength(1);
    expect(profile.testFiles).toHaveLength(1);
  });

  it('survives malformed package.json without inventing a framework', () => {
    expect(profiler.profile([{ path: 'package.json', content: '{' }]).framework).toBe('node');
  });
});
