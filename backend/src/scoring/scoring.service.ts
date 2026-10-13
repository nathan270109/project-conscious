import { Injectable } from '@nestjs/common';

import {
    AnalysisCategory,
    DimensionScore,
    AnalyzerResult,
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

    calculate(results: readonly AnalyzerResult[]): ScoringResult {
        const dimensions = this.categories.map((category) => ({
            category,
            score: this.calculateDimensionScore(
                category,
                results.find((result) => result.category === category),
            ),
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
        result: AnalyzerResult | undefined,
    ): number {
        if (!result || result.category !== category) return 0;
        const penalty = result.findings
            .reduce(
                (sum, finding) => {
                    const factor = 1 + Math.min(2, Math.log2(finding.occurrences)) * 0.25;
                    return sum + this.severityPenalty[finding.severity] * factor;
                },
                0,
            );

        return Math.round(Math.max(0, Math.min(100, 100 - penalty)));
    }
}
