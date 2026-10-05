import saved from '../../../../backend/src/demo-data/analysis-result.json';
import { isAnalysisResult } from './analysis-result.guard';
import type { CompletedAnalysisResult } from './analysis-result.model';

// O bundler inclui o mesmo JSON do backend, sem requisição de rede.
export const DEMO_PROJECT_ID = saved.projectId;
export const DEMO_REPOSITORY_URL = 'https://github.com/katherinykamili/project-conscious-demo';
export const DEMO_REVISION = '2770289e71c3ea7ef0e89ba056f67ba99f4110ee';

export function readDemoAnalysis(): CompletedAnalysisResult {
  if (!isAnalysisResult(saved, DEMO_PROJECT_ID) ||
      saved.status !== 'COMPLETED' || saved.demoMode !== true) {
    throw new Error('Resultado demonstrativo incompatível com o contrato.');
  }
  return structuredClone(saved);
}
