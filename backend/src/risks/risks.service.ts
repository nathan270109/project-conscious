import { Injectable } from '@nestjs/common';
import { Finding, Severity } from '../analysis/types/analysis.types.js';

@Injectable()
export class RisksService {
  // Mapeia os níveis de severidade para pesos numéricos, facilitando a ordenação decrescente
  private readonly severityWeight: Record<Severity, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  /**
   * Ordena uma lista de achados (findings) priorizando a severidade,
   * seguida por categoria, arquivo e número da linha.
   */
  sortByPriority(findings: Finding[]): Finding[] {
    // Cria uma cópia rasa do array para não modificar o array original recebido
    return [...findings].sort((first, second) => {
      // 1º Critério: Compara a severidade (maior peso vem primeiro)
      const severityDifference =
        this.severityWeight[second.severity] -
        this.severityWeight[first.severity];

      if (severityDifference !== 0) {
        return severityDifference;
      }

      // 2º Critério: Desempate determinístico pela categoria
      const categoryDifference = this.compareText(
        first.category,
        second.category,
      );

      if (categoryDifference !== 0) {
        return categoryDifference;
      }

      // 3º Critério: Desempate determinístico pelo caminho do arquivo
      const fileDifference = this.compareText(first.file, second.file);

      if (fileDifference !== 0) {
        return fileDifference;
      }

      // 4º Critério: Desempate por número da linha (trata null como -1)
      return (first.line ?? -1) - (second.line ?? -1);
    });
  }

  private compareText(first: string, second: string): number {
    if (first === second) {
      return 0;
    }

    return first < second ? -1 : 1;
  }
}
