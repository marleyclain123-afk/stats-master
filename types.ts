export interface ClassRow {
  id: string;
  lower: number;
  upper: number;
  frequency: number;
}

export interface StatResult {
  totalFrequency: number;
  totalProduct: number;
  mean: number;
  rows: Array<ClassRow & { center: number; product: number }>;
}
