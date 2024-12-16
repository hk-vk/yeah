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
}

export type InputType = 'text' | 'url' | 'image';

export type AnalysisResult = {
  isReliable: boolean;
  confidence: number;
  analysis: string;
  indicators: IndicatorResult[];
};
