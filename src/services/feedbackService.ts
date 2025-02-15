import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface FeedbackData {
  feedback_text: string;
  user_id?: string;
  analysis_id?: string;
}

export const feedbackService = {
  async submitFeedback(data: FeedbackData) {
    try {
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .insert([
          {
            feedback_text: data.feedback_text,
            user_id: data.user_id,
            analysis_id: data.analysis_id,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      toast.success('Feedback submitted successfully!');
      return feedbackData;
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
      throw error;
    }
  },

  async getFeedback() {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch feedback');
      throw error;
    }
  }
}
