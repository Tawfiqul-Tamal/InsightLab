declare module 'ml-random-forest' {
  export interface RandomForestOptions {
    nEstimators?: number;
    maxFeatures?: number;
    replacement?: boolean;
    seed?: number;
    useSampleBagging?: boolean;
  }

  export class RandomForestClassifier {
    constructor(options?: RandomForestOptions);
    train(trainingSet: number[][], predictions: number[]): void;
    predict(toPredict: number[][]): number[];
  }

  export class RandomForestRegression {
    constructor(options?: RandomForestOptions);
    train(trainingSet: number[][], predictions: number[]): void;
    predict(toPredict: number[][]): number[];
  }
}

declare module 'ml-cart' {
  export interface DecisionTreeOptions {
    gainFunction?: string;
    splitFunction?: string;
    minNumSamples?: number;
    maxDepth?: number;
  }

  export class DecisionTreeClassifier {
    constructor(options?: DecisionTreeOptions);
    train(trainingSet: number[][], predictions: number[]): void;
    predict(toPredict: number[][]): number[];
  }

  export class DecisionTreeRegression {
    constructor(options?: DecisionTreeOptions);
    train(trainingSet: number[][], predictions: number[]): void;
    predict(toPredict: number[][]): number[];
  }
}

declare module 'ml-regression-multivariate-linear' {
  export default class MLR {
    constructor(x: number[][], y: number[][], options?: { intercept?: boolean });
    predict(toPredict: number[][]): number[][];
  }
}

declare module 'ml-knn' {
  export interface KNNOptions {
    k?: number;
    distance?: (a: number[], b: number[]) => number;
  }

  export default class KNN {
    constructor(dataset: number[][], labels: number[], options?: KNNOptions);
    predict(toPredict: number[][]): number[];
  }
}
