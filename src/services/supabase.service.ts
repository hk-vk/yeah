import { supabase } from '../lib/supabase';
import type { Analysis, AnalysisType, Feedback } from '../types/supabase';

export class SupabaseService {
  static async saveAnalysis(
    type: AnalysisType,
    input: Analysis['input'],
    result: any,
    userId?: string
  ) {
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        type,
        input,
        result,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async saveFeedback(
    analysisId: string,
    rating: number,
    comment?: string,
    userId?: string
  ) {
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        analysis_id: analysisId,
        rating,
        comment,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAnalysisByUserId(userId: string) {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getAnalysisById(id: string) {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getFeedbackByAnalysisId(analysisId: string) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
} 