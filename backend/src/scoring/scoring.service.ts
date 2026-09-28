import { Injectable } from '@nestjs/common';

import {
    AnalysisCategory,
    DimensionScore,
    Finding,
    Severity,
} from '../analysis/types/analysis.types.js';

export interface ScoringResult {
    dimensions: DimensionScore[];
    score: number;
}

@Injectable()
export class ScoringService {
    private readonly categories: AnalysisCategory[] = [
        'DOCUMENTATION',
        'TESTS',
        'ACCESSIBILITY',
        'ORGANIZATION',
        'MAINTAINABILITY',
    ];

    private readonly severityPenalty: Record<Severity, number> = {
        CRITICAL: 40,
        HIGH: 25,
        MEDIUM: 10,
        LOW: 5,
    };

    calculate(findings: Finding[]): ScoringResult {
        const dimensions = this.categories.map((category) => ({
            category,
            score: this.calculateDimensionScore(category, findings),
        }));

        const score = Math.round(
            dimensions.reduce((sum, dimension) => sum + dimension.score, 0) /
            dimensions.length,
        );

        return {
            dimensions,
            score,
        };
    }

    private calculateDimensionScore(
        category: AnalysisCategory,
        findings: Finding[],
    ): number {
        const penalty = findings
            .filter((finding) => finding.category === category)
            .reduce(
                (sum, finding) => sum + this.severityPenalty[finding.severity],
                0,
            );

        return Math.max(0, Math.min(100, 100 - penalty));
    }
}