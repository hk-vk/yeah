export interface TextAnalysisResult {
  isReliable: boolean;
  confidence: number;
  analysis: string;
  indicators: Array<{
    id: string;
    score: number;
  }>;
}

export interface ImageAnalysisResponse {
  verdict: string;
  score: number;
  details: {
    ai_generated: boolean;
    deepfake: boolean;
    tampering_analysis: {
      tampered: boolean;
      confidence: number;
      regions?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
      }>;
    };
    image_caption: string;
    reverse_search: {
      matches: Array<{
        url: string;
        title: string;
        similarity: number;
      }>;
    };
  };
}

export type InputType = 'text' | 'url' | 'image';

export interface AnalysisInput {
  text?: string;
  image?: File;
  type: InputType;
}

export type AnalysisResult = TextAnalysisResult | ImageAnalysisResponse;