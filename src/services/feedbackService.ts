import { supabase } from '../lib/supabase';

export interface FeedbackData {
  rating: number;
  comment?: string;
  feedback_text?: string;
  user_id?: string;
  analysis_id?: string;
  analysis_result_id?: string;
}

export const feedbackService = {
  async submitFeedback(data: FeedbackData) {
    try {
      console.log('Submitting feedback:', {
        rating: data.rating,
        hasComment: !!data.comment,
        hasUserId: !!data.user_id,
        hasAnalysisResultId: !!data.analysis_result_id
      });
      
      // Prepare the data - use only fields that exist in the feedback table
      const feedbackData = {
        rating: data.rating,
        comment: data.comment || data.feedback_text,
        user_id: data.user_id,
        analysis_result_id: data.analysis_result_id || data.analysis_id, // Support both field names
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (error) {
        console.error('Supabase error when submitting feedback:', error);
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Exception when submitting feedback:', error);
      throw error;
    }
  },

  async getFeedback() {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }
};
