import { RandomForestClassifier, RandomForestRegression } from 'ml-random-forest';
import { DecisionTreeClassifier, DecisionTreeRegression } from 'ml-cart';
import MLR from 'ml-regression-multivariate-linear';
import KNN from 'ml-knn';
import { isNumeric } from './analyze';
import { TrainResponse, ModelMetric } from '../types';

// Simple deterministic Mulberry32 PRNG for reproducible shuffling
function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function trainModels(
  rawRows: Record<string, string | null>[],
  targetColumn: string
): TrainResponse {
  if (rawRows.length === 0) {
    throw new Error('Dataset is empty');
  }

  const allColumns = Object.keys(rawRows[0]);
  if (!allColumns.includes(targetColumn)) {
    throw new Error(`Target column "${targetColumn}" not found in dataset`);
  }

  // 1. Drop duplicates
  const seenRows = new Set<string>();
  const rows: Record<string, string | null>[] = [];
  for (const row of rawRows) {
    const key = JSON.stringify(row);
    if (!seenRows.has(key)) {
      seenRows.add(key);
      rows.push(row);
    }
  }

  if (rows.length < 10) {
    throw new Error('Dataset has too few unique rows (minimum 10 required for training)');
  }

  // 2. Identify column types and missing value strategies
  const numericCols = new Set<string>();
  const means: Record<string, number> = {};
  const modes: Record<string, string> = {};

  for (const col of allColumns) {
    let numCount = 0;
    let nonMissingCount = 0;
    const numValues: number[] = [];
    const catFreq = new Map<string, number>();

    for (const r of rows) {
      const v = r[col];
      if (v !== null && v !== undefined && v.trim() !== '') {
        nonMissingCount++;
        const trimmed = v.trim();
        catFreq.set(trimmed, (catFreq.get(trimmed) || 0) + 1);
        if (isNumeric(trimmed)) {
          numCount++;
          numValues.push(Number(trimmed));
        }
      }
    }

    const isNum = nonMissingCount > 0 && numCount / nonMissingCount >= 0.75;
    if (isNum) {
      numericCols.add(col);
      const mean = numValues.length > 0 ? numValues.reduce((a, b) => a + b, 0) / numValues.length : 0;
      means[col] = mean;
    } else {
      let maxCount = -1;
      let modeVal = 'Unknown';
      for (const [k, count] of catFreq.entries()) {
        if (count > maxCount) {
          maxCount = count;
          modeVal = k;
        }
      }
      modes[col] = modeVal;
    }
  }

  // 3. Impute missing values
  const cleanedRows: Record<string, string | number>[] = rows.map((r) => {
    const clean: Record<string, string | number> = {};
    for (const col of allColumns) {
      const v = r[col];
      const isMissing = v === null || v === undefined || v.trim() === '';
      if (numericCols.has(col)) {
        clean[col] = isMissing ? means[col] : Number(v!.trim());
      } else {
        clean[col] = isMissing ? modes[col] : v!.trim();
      }
    }
    return clean;
  });

  // 4. Detect task type
  // "numeric target with more than 10 unique values = regression, else classification"
  const targetIsNumeric = numericCols.has(targetColumn);
  const targetUniqueValues = new Set(cleanedRows.map((r) => r[targetColumn])).size;
  const taskType: 'regression' | 'classification' =
    targetIsNumeric && targetUniqueValues > 10 ? 'regression' : 'classification';

  // 5. Build feature matrix X and target array y
  const featureCols = allColumns.filter((c) => c !== targetColumn);

  // Collect distinct values for one-hot encoding categorical features
  const categoricalFeatureValues: Record<string, string[]> = {};
  for (const f of featureCols) {
    if (!numericCols.has(f)) {
      const uniqueVals = Array.from(new Set(cleanedRows.map((r) => String(r[f])))).sort();
      categoricalFeatureValues[f] = uniqueVals;
    }
  }

  // Transform each row into a numeric feature vector
  const X: number[][] = cleanedRows.map((r) => {
    const vec: number[] = [];
    for (const f of featureCols) {
      if (numericCols.has(f)) {
        vec.push(Number(r[f]));
      } else {
        const valStr = String(r[f]);
        const possible = categoricalFeatureValues[f];
        for (const cat of possible) {
          vec.push(valStr === cat ? 1 : 0);
        }
      }
    }
    return vec;
  });

  // Encode target
  let y: number[] = [];
  const targetLabelMap: Record<string, number> = {};
  if (taskType === 'regression') {
    y = cleanedRows.map((r) => Number(r[targetColumn]));
  } else {
    const uniqueLabels = Array.from(new Set(cleanedRows.map((r) => String(r[targetColumn])))).sort();
    uniqueLabels.forEach((label, idx) => {
      targetLabelMap[label] = idx;
    });
    y = cleanedRows.map((r) => targetLabelMap[String(r[targetColumn])]);
  }

  // 6. 80/20 train/test split with fixed seed
  const rng = mulberry32(42);
  const indices = Array.from({ length: cleanedRows.length }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  const trainCount = Math.max(1, Math.floor(indices.length * 0.8));
  const trainIndices = indices.slice(0, trainCount);
  const testIndices = indices.slice(trainCount);

  const X_train = trainIndices.map((i) => X[i]);
  const y_train = trainIndices.map((i) => y[i]);
  const X_test = testIndices.map((i) => X[i]);
  const y_test = testIndices.map((i) => y[i]);

  const models: ModelMetric[] = [];

  if (taskType === 'regression') {
    // 1. Random Forest Regression
    try {
      const rf = new RandomForestRegression({ nEstimators: 25, seed: 42 });
      rf.train(X_train, y_train);
      const preds = rf.predict(X_test);
      models.push({
        name: 'Random Forest Regression',
        metrics: calcRegressionMetrics(y_test, preds),
      });
    } catch {
      models.push({
        name: 'Random Forest Regression',
        metrics: { R2: 0, RMSE: 999 },
      });
    }

    // 2. Decision Tree Regression
    try {
      const dt = new DecisionTreeRegression();
      dt.train(X_train, y_train);
      const preds = dt.predict(X_test);
      models.push({
        name: 'Decision Tree Regression',
        metrics: calcRegressionMetrics(y_test, preds),
      });
    } catch {
      models.push({
        name: 'Decision Tree Regression',
        metrics: { R2: 0, RMSE: 999 },
      });
    }

    // 3. Multivariate Linear Regression
    try {
      const y_train_2d = y_train.map((v) => [v]);
      const mlr = new MLR(X_train, y_train_2d, { intercept: true });
      const preds2d = mlr.predict(X_test);
      const preds = preds2d.map((row) => (Array.isArray(row) ? row[0] : Number(row)));
      models.push({
        name: 'Linear Regression (MLR)',
        metrics: calcRegressionMetrics(y_test, preds),
      });
    } catch {
      models.push({
        name: 'Linear Regression (MLR)',
        metrics: { R2: 0, RMSE: 999 },
      });
    }
  } else {
    // Classification
    // 1. Random Forest Classifier
    try {
      const rf = new RandomForestClassifier({ nEstimators: 25, seed: 42 });
      rf.train(X_train, y_train);
      const preds = rf.predict(X_test);
      models.push({
        name: 'Random Forest Classifier',
        metrics: calcClassificationMetrics(y_test, preds),
      });
    } catch {
      models.push({
        name: 'Random Forest Classifier',
        metrics: { Accuracy: 0, 'Macro F1': 0 },
      });
    }

    // 2. Decision Tree Classifier
    try {
      const dt = new DecisionTreeClassifier();
      dt.train(X_train, y_train);
      const preds = dt.predict(X_test);
      models.push({
        name: 'Decision Tree Classifier',
        metrics: calcClassificationMetrics(y_test, preds),
      });
    } catch {
      models.push({
        name: 'Decision Tree Classifier',
        metrics: { Accuracy: 0, 'Macro F1': 0 },
      });
    }

    // 3. KNN Classifier
    try {
      const k = Math.min(5, Math.max(1, Math.floor(X_train.length / 4)));
      const knn = new KNN(X_train, y_train, { k });
      const preds = knn.predict(X_test);
      models.push({
        name: 'K-Nearest Neighbors (KNN)',
        metrics: calcClassificationMetrics(y_test, preds),
      });
    } catch {
      models.push({
        name: 'K-Nearest Neighbors (KNN)',
        metrics: { Accuracy: 0, 'Macro F1': 0 },
      });
    }
  }

  // Determine best model
  let bestModel = models[0]?.name || 'N/A';
  if (taskType === 'regression') {
    let maxR2 = -Infinity;
    for (const m of models) {
      const r2 = m.metrics['R2'] ?? -Infinity;
      if (r2 > maxR2) {
        maxR2 = r2;
        bestModel = m.name;
      }
    }
  } else {
    let maxF1 = -Infinity;
    for (const m of models) {
      const f1 = m.metrics['Macro F1'] ?? m.metrics['Accuracy'] ?? -Infinity;
      if (f1 > maxF1) {
        maxF1 = f1;
        bestModel = m.name;
      }
    }
  }

  return {
    taskType,
    targetColumn,
    bestModel,
    models,
    trainRows: X_train.length,
    testRows: X_test.length,
  };
}

function calcRegressionMetrics(
  y_true: number[],
  y_pred: number[]
): { R2: number; RMSE: number } {
  const n = y_true.length;
  if (n === 0) return { R2: 0, RMSE: 0 };

  const meanTrue = y_true.reduce((a, b) => a + b, 0) / n;
  let ssTot = 0;
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    const actual = y_true[i];
    const predicted = isNaN(y_pred[i]) || !isFinite(y_pred[i]) ? meanTrue : y_pred[i];
    ssTot += Math.pow(actual - meanTrue, 2);
    ssRes += Math.pow(actual - predicted, 2);
  }

  let r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  // Bound R2 reasonably for display (minimum -1)
  if (r2 < -1) r2 = -1;
  const rmse = Math.sqrt(ssRes / n);

  return {
    R2: Number(r2.toFixed(4)),
    RMSE: Number(rmse.toFixed(4)),
  };
}

function calcClassificationMetrics(
  y_true: number[],
  y_pred: number[]
): { Accuracy: number; 'Macro F1': number } {
  const n = y_true.length;
  if (n === 0) return { Accuracy: 0, 'Macro F1': 0 };

  let correct = 0;
  for (let i = 0; i < n; i++) {
    if (Math.round(y_pred[i]) === y_true[i]) {
      correct++;
    }
  }
  const accuracy = correct / n;

  // Macro F1
  const uniqueClasses = Array.from(new Set(y_true));
  let f1Sum = 0;

  for (const c of uniqueClasses) {
    let tp = 0;
    let fp = 0;
    let fn = 0;

    for (let i = 0; i < n; i++) {
      const pred = Math.round(y_pred[i]);
      const actual = y_true[i];
      if (actual === c && pred === c) tp++;
      else if (actual !== c && pred === c) fp++;
      else if (actual === c && pred !== c) fn++;
    }

    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    f1Sum += f1;
  }

  const macroF1 = uniqueClasses.length === 0 ? 0 : f1Sum / uniqueClasses.length;

  return {
    Accuracy: Number(accuracy.toFixed(4)),
    'Macro F1': Number(macroF1.toFixed(4)),
  };
}
