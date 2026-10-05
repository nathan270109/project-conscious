import { createHash } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { AnalysisModule } from '../analysis/analysis.module.js';
import { ANALYSIS_ENGINE } from '../analysis/analysis-engine.interface.js';
import type { AnalysisEngine } from '../analysis/analysis-engine.interface.js';
import saved from '../demo-data/analysis-result.json' with { type: 'json' };
import snapshot from '../demo-data/repository-snapshot.json' with { type: 'json' };
import { DemoService } from './demo.service.js';

describe('DemoService — evidência reproduzível', () => {
  it('reproduz exatamente o JSON com o motor real e os arquivos salvos', async () => {
    const module = await Test.createTestingModule({ imports: [AnalysisModule] }).compile();
    try {
      const actual = await module.get<AnalysisEngine>(ANALYSIS_ENGINE).analyze(snapshot.files);
      expect(actual).toEqual({
        score: saved.score, dimensions: saved.dimensions,
        findings: saved.findings, insight: saved.insight,
      });
      expect(new Set(actual.findings.map(f => f.category)).size).toBe(5);
    } finally {
      await module.close();
    }
  });

  it('preserva os bytes dos blobs verificados na revisão pública', () => {
    for (const file of snapshot.files) {
      const bytes = Buffer.from(file.content);
      const hash = createHash('sha1')
        .update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
      expect(hash, file.path).toBe(file.sha);
    }
  });

  it('retorna cópias independentes, com data salva e identidade exclusiva do demo', () => {
    const service = new DemoService();
    const first = service.getDemoAnalysis();
    first.findings.reverse();
    first.dimensions[0].score = 0;
    expect(service.getDemoAnalysis()).toEqual(saved);
    expect(service.getDemoAnalysis().demoMode).toBe(true);
    expect(new Date(saved.analyzedAt).toISOString()).toBe(saved.analyzedAt);
  });
});
