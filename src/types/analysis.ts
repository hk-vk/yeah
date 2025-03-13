export interface BaseAnalysisResult {
  id?: string;
  type: 'text' | 'image' | 'url' | 'text_image';
  created_at?: string;
  updated_at?: string;
}

export interface TextAnalysisResult extends BaseAnalysisResult {
  type: 'text' | 'url';
  ISFAKE: number;
  CONFIDENCE: number;
  EXPLANATION_EN: string;
  EXPLANATION_ML: string;
  input?: {
    url?: string;
    title?: string;
    published_date?: string;
    image_url?: string;
  };
  urlAnalysis?: {
    url: string;
    prediction: string;
    prediction_probabilities: number[];
    google_safe_browsing_flag: boolean;
    trusted: boolean;
    trust_score: number;
    is_trustworthy: boolean;
    trust_reasons: string[];
    final_decision: string;
  };
}

export interface ImageAnalysisResult extends BaseAnalysisResult {
  type: 'image' | 'text_image';
  verdict: string;
  score: number;
  details: {
    ai_generated: boolean;
    reverse_search: {
      found: boolean;
      matches?: any[];
    };
    deepfake: boolean;
    tampering_analysis: boolean;
    image_caption: string;
    text_analysis?: {
      user_text: string;
      extracted_text: string;
      mismatch: boolean;
      context_similarity: number;
      context_mismatch: boolean;
    };
  };
}

export type AnalysisResult = TextAnalysisResult | ImageAnalysisResult;

export type InputType = 'text' | 'url' | 'image';

export interface AnalysisInput {
  text?: string;
  image?: File;
  type: InputType;
}