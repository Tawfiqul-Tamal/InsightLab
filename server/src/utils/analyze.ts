import {
  AnalyzeResponse,
  ColumnMetadata,
  CorrelationMatrix,
  NumericDistribution,
  CategoricalDistribution,
} from '../types';

export function isNumeric(val: unknown): boolean {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && isFinite(num);
}

export function analyzeDataset(rows: Record<string, string | null>[]): AnalyzeResponse {
  if (rows.length === 0) {
    return {
      rowCount: 0,
      columns: [],
      correlationMatrix: { columns: [], matrix: [] },
      topRows: [],
      distributions: {},
    };
  }

  const columnNames = Object.keys(rows[0]);
  const rowCount = rows.length;

  // Determine column types and collect stats
  const columns: ColumnMetadata[] = [];
  const numericColumns: string[] = [];

  for (const col of columnNames) {
    let missingCount = 0;
    let numericCount = 0;
    const values: string[] = [];
    const numValues: number[] = [];
    const uniqueSet = new Set<string>();

    for (const row of rows) {
      const rawVal = row[col];
      if (rawVal === null || rawVal === undefined || rawVal === '' || rawVal.trim() === '') {
        missingCount++;
      } else {
        const trimmed = rawVal.trim();
        values.push(trimmed);
        uniqueSet.add(trimmed);
        if (isNumeric(trimmed)) {
          numericCount++;
          numValues.push(Number(trimmed));
        }
      }
    }

    const nonMissingCount = rowCount - missingCount;
    // If >75% of non-missing values are numeric, classify as numeric
    const isNumCol = nonMissingCount > 0 && numericCount / nonMissingCount >= 0.75;

    if (isNumCol && numValues.length > 0) {
      numericColumns.push(col);
      const sum = numValues.reduce((acc, v) => acc + v, 0);
      const mean = sum / numValues.length;
      const min = Math.min(...numValues);
      const max = Math.max(...numValues);

      columns.push({
        name: col,
        type: 'numeric',
        missingCount,
        uniqueCount: uniqueSet.size,
        mean: Number(mean.toFixed(2)),
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
      });
    } else {
      columns.push({
        name: col,
        type: 'categorical',
        missingCount,
        uniqueCount: uniqueSet.size,
      });
    }
  }

  // Calculate Distributions
  const distributions: Record<string, NumericDistribution | CategoricalDistribution> = {};

  for (const colMeta of columns) {
    const col = colMeta.name;

    if (colMeta.type === 'numeric') {
      const validNumbers: number[] = [];
      for (const row of rows) {
        const val = row[col];
        if (isNumeric(val)) {
          validNumbers.push(Number(val));
        }
      }

      if (validNumbers.length === 0) {
        distributions[col] = { type: 'numeric', bins: [] };
        continue;
      }

      const min = Math.min(...validNumbers);
      const max = Math.max(...validNumbers);
      const binCount = Math.min(10, Math.max(5, Math.floor(Math.sqrt(validNumbers.length))));
      const range = max - min;
      const step = range === 0 ? 1 : range / binCount;

      const bins = Array.from({ length: binCount }, (_, i) => ({
        binStart: Number((min + i * step).toFixed(2)),
        binEnd: Number((min + (i + 1) * step).toFixed(2)),
        count: 0,
      }));

      for (const val of validNumbers) {
        let index = Math.floor((val - min) / step);
        if (index >= binCount) index = binCount - 1;
        if (index < 0) index = 0;
        bins[index].count++;
      }

      distributions[col] = {
        type: 'numeric',
        bins,
      };
    } else {
      // Categorical frequency
      const freqMap = new Map<string, number>();
      for (const row of rows) {
        const val = row[col];
        const key = val && val.trim() !== '' ? val.trim() : '(Missing)';
        freqMap.set(key, (freqMap.get(key) || 0) + 1);
      }

      const sorted = Array.from(freqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([category, count]) => ({ category, count }));

      distributions[col] = {
        type: 'categorical',
        counts: sorted,
      };
    }
  }

  // Calculate Correlation Matrix for numeric columns
  const numColCount = numericColumns.length;
  const matrix: number[][] = Array.from({ length: numColCount }, () =>
    new Array(numColCount).fill(0)
  );

  if (numColCount > 0) {
    // Collect numeric vectors (fill missing with mean for correlation calculation)
    const vectors: number[][] = [];
    for (const col of numericColumns) {
      const meta = columns.find((c) => c.name === col);
      const mean = meta?.mean ?? 0;
      const vec: number[] = [];
      for (const row of rows) {
        const val = row[col];
        vec.push(isNumeric(val) ? Number(val) : mean);
      }
      vectors.push(vec);
    }

    for (let i = 0; i < numColCount; i++) {
      matrix[i][i] = 1;
      for (let j = i + 1; j < numColCount; j++) {
        const x = vectors[i];
        const y = vectors[j];
        const n = x.length;

        const xMean = x.reduce((a, b) => a + b, 0) / n;
        const yMean = y.reduce((a, b) => a + b, 0) / n;

        let num = 0;
        let denX = 0;
        let denY = 0;

        for (let k = 0; k < n; k++) {
          const dx = x[k] - xMean;
          const dy = y[k] - yMean;
          num += dx * dy;
          denX += dx * dx;
          denY += dy * dy;
        }

        const denom = Math.sqrt(denX * denY);
        const corr = denom === 0 ? 0 : num / denom;
        const rounded = Number(corr.toFixed(2));
        matrix[i][j] = rounded;
        matrix[j][i] = rounded;
      }
    }
  }

  const correlationMatrix: CorrelationMatrix = {
    columns: numericColumns,
    matrix,
  };

  // Top 10 rows formatted
  const topRows = rows.slice(0, 10).map((row) => {
    const formatted: Record<string, string | number | null> = {};
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (v === null || v === undefined || v === '') {
        formatted[key] = null;
      } else if (isNumeric(v)) {
        formatted[key] = Number(v);
      } else {
        formatted[key] = v;
      }
    }
    return formatted;
  });

  return {
    rowCount,
    columns,
    correlationMatrix,
    topRows,
    distributions,
  };
}
