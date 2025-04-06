export type AnalysisType = 'text' | 'image' | 'url' | 'text_image';

export interface AnalysisResult {
  id: string;
  user_id: string;
  type: AnalysisType;
  input: {
    text?: string;
    image_url?: string;
    url?: string;
  };
  result: {
    verdict?: string;
    explanation?: string;
    score?: number;
    details?: {
      ai_generated?: boolean;
      reverse_search?: {
        found: boolean;
        matches?: any[];
      };
      deepfake?: boolean;
      tampering_analysis?: boolean;
      text_analysis?: {
        mismatch?: boolean;
        context_similarity?: number;
        context_mismatch?: boolean;
      };
    };
    ISFAKE?: number;
    CONFIDENCE?: number;
    EXPLANATION_EN?: string;
    EXPLANATION_ML?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  analysis_result_id: string;  // Make this required and consistent
  user_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      analysis_result: {
        Row: AnalysisResult;
        Insert: Omit<AnalysisResult, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<AnalysisResult, 'id' | 'created_at' | 'updated_at'>>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Feedback, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
        };
        Update: Partial<{
          email: string;
          full_name?: string;
          avatar_url?: string;
        }>;
      };
    };
  };
};