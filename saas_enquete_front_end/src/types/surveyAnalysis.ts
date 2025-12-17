export type NumericStats = {
  count: number;
  min: number;
  max: number;
  average: number;
  median: number;
  stdDev: number;
};

export type CategoricalStat = {
  option: string;
  count: number;
  percentage: number;
};

export type QuestionAnalysis = {
  questionId: string;
  label: string;
  type: string;
  stats: NumericStats | CategoricalStat[] | Record<string, any>;
  anomalies?: string[];
};

export type Comparison = {
  dimension: string;
  metric: string;
  best?: string;
  worst?: string;
  trend?: "up" | "down" | "stable";
};

export type SurveyAnalysisResult = {
  survey: {
    id: string;
    title: string;
  };
  globalMetrics: {
    totalResponses: number;
  };
  questionsAnalysis: QuestionAnalysis[];
  comparisons: Comparison[];
};
