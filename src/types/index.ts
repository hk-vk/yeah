export interface Article {
  text: string;
  credibilityScore: number;
  indicators: IndicatorResult[];
}

export interface Translation {
  name: string;
  description: string;
}

export interface IndicatorType {
  id: string;
  translations: {
    ml: Translation;
    en: Translation;
  };
}

export interface IndicatorResult {
  id: string;
  score: number;
  title?: string;  // Optional title for custom display text
}

export type InputType = 'text' | 'url' | 'image';

export interface Indicator {
  name: string;
  status: 'success' | 'warning' | 'error';
}

export interface AnalysisResult {
  id?: string;
  ISFAKE: number;
  CONFIDENCE: number;
  EXPLANATION_EN: string;
  EXPLANATION_ML: string;
}

export interface WritingStyleResult {
  sensationalism: number;
  writingStyle: number;
  clickbait: number;
}

export interface AuthResponse {
  user: any;
  session: any;
}

export type AnalysisIndicator = {
  title: string;
  score: number;
  description: string;
};

export interface AnalysisRequest {
  query: string;
}

export interface HistoryItem {
  id: string;
  type: string;
  input: any;
  result: any;
  created_at: string;
}

export * from './analysis';
export * from './trending';
export * from './supabase';
