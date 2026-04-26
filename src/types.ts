export type AnalysisType = 'pros-cons' | 'table' | 'swot';

export interface AnalysisResult {
  title: string;
  summary: string;
  data: any; // Depending on type
  type: AnalysisType;
}

export interface ProsConsData {
  pros: string[];
  cons: string[];
  conclusion: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  recommendation: string;
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicAdvice: string;
}
