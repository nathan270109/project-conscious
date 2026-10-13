import type { RepositoryFile } from '../../github/github.service.js';
import { RepositoryProfiler } from '../repository-profiler.service.js';
import { DocumentationAnalyzer } from './documentation.analyzer.js';

describe('DocumentationAnalyzer', () => {
  const analyzer = new DocumentationAnalyzer();
  const profiler = new RepositoryProfiler();
  const analyze = (files: RepositoryFile[]) => analyzer.analyze(files, profiler.profile(files));

  it('accepts substantive, executable documentation', () => {
    const files = [{ path: 'package.json', content: '{"scripts":{"start":"node .","test":"vitest"}}' },
      { path: 'src/app.spec.ts', content: 'test("x",()=>expect(1).toBe(1))' },
      { path: 'README.md', content: '# Produto\nEste produto analisa repositórios e apresenta riscos técnicos explicáveis para equipes tomarem decisões com evidências.\n## Instalação\n```sh\nnpm install\n```\n## Execução\n```sh\nnpm run start\n```\n## Testes\n```sh\nnpm test\n```' }];
    expect(analyze(files).findings).toEqual([]);
  });

  it('finds missing and shallow documentation', () => {
    expect(analyze([{ path: 'src/app.ts', content: '' }]).findings[0].ruleId).toBe('DOC001');
    expect(analyze([{ path: 'README.md', content: '# Projeto\nCurto.' }]).findings.map((f) => f.ruleId))
      .toEqual(['DOC002', 'DOC003', 'DOC004']);
  });

  it('verifies documented scripts against package.json', () => {
    const files = [{ path: 'package.json', content: '{"scripts":{"start":"node ."}}' },
      { path: 'README.md', content: '# Produto\nDescrição extensa do produto, público, capacidades, limites e objetivo para tornar o onboarding confiável.\n## Instalação\nnpm install\n## Execução\nnpm run dev' }];
    expect(analyze(files).findings).toEqual([expect.objectContaining({ ruleId: 'DOC006' })]);
  });
});
