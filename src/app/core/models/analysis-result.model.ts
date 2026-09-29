export type FindingCategory =
    | 'DOCUMENTATION'
    | 'TESTS'
    | 'ACCESSIBILITY'
    | 'ORGANIZATION'
    | 'MAINTAINABILITY';

export interface Finding {
    category: FindingCategory;
    severity: string;
    message: string;
    file?: string;
    line?: number;
}

export interface Insight {
    category: FindingCategory;
    title: string;
    message: string;
}

export interface AnalysisResult {
    projectId: string;
    status: string;
    score: number;
    dimensions: {
        documentation: number;
        tests: number;
        accessibility: number;
        organization: number;
        maintainability: number;
    };
    findings: Finding[];
    insight: Insight | null;
    demoMode?: boolean;

}

export interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  description: string;
  createdAt: Date;
}

export type ProjectDraft = Pick<Project, 'name' | 'repositoryUrl' | 'description'>;

