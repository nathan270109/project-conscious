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
    insight: string;
    demoMode?: boolean;
}