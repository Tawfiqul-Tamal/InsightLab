export interface ColumnMetadata {
  name: string;
  type: 'numeric' | 'categorical';
  missingCount: number;
  uniqueCount: number;
  mean?: number;
  min?: number;
  max?: number;
}

export interface NumericBin {
  binStart: number;
  binEnd: number;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface NumericDistribution {
  type: 'numeric';
  bins: NumericBin[];
}

export interface CategoricalDistribution {
  type: 'categorical';
  counts: CategoryCount[];
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
}

export interface AnalyzeResponse {
  rowCount: number;
  columns: ColumnMetadata[];
  correlationMatrix: CorrelationMatrix;
  topRows: Record<string, string | number | null>[];
  distributions: Record<string, NumericDistribution | CategoricalDistribution>;
}

export interface ModelMetric {
  name: string;
  metrics: Record<string, number>;
}

export interface TrainResponse {
  taskType: 'regression' | 'classification';
  targetColumn: string;
  bestModel: string;
  models: ModelMetric[];
  trainRows: number;
  testRows: number;
}
