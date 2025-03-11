import { supabase } from '../lib/supabase';
import type { AnalysisResult, AnalysisType, Feedback } from '../types/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { TrendingNews } from '../types/trending';

export class SupabaseService {
  static async saveAnalysis(
    type: AnalysisType,
    input: AnalysisResult['input'],
    result: AnalysisResult['result'],
    userId?: string,
    analysisId?: string
  ) {
    try {
      // Validate input
      if (!type || !input) {
        throw new Error('Type and input are required');
      }

      // Use provided ID or generate a new UUID if not provided
      const id = analysisId || uuidv4();

      // Prepare the data to be inserted
      const analysisData = {
        id,
        type,
        input,
        result,
        user_id: userId || null, // Ensure user_id is explicitly null if not provided
        created_at: new Date().toISOString(), // Add created_at timestamp
        updated_at: new Date().toISOString()  // Add updated_at timestamp
      };

      console.log('Saving analysis to Supabase:', {
        id,
        type,
        hasInput: !!input,
        hasResult: !!result,
        hasUserId: !!userId,
        resultSummary: {
          hasVerdict: !!result?.verdict,
          hasExplanation: !!result?.explanation,
          hasScore: !!result?.score,
          hasDetails: !!result?.details,
        }
      });
      
      // First try to insert
      let { data, error } = await supabase
        .from('analysis_result')
        .insert(analysisData)
        .select()
        .single();

      // If insert fails due to conflict, try update
      if (error?.code === '23505') { // Unique violation error code
        const { data: updatedData, error: updateError } = await supabase
          .from('analysis_result')
          .update(analysisData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating analysis in Supabase:', updateError);
          return { id };
        }

        data = updatedData;
      } else if (error) {
        console.error('Error inserting analysis to Supabase:', error);
        return { id };
      }

      console.log('Analysis saved successfully with ID:', data.id);
      return data;
    } catch (error) {
      console.error('Exception saving analysis to Supabase:', error);
      
      // Generate a local ID with timestamp for tracking
      const localId = analysisId || `local-${Date.now()}`;
      console.log(`Using ID for analysis due to exception: ${localId}`);
      
      return { id: localId };
    }
  }

  static async updateAnalysis(
    id: string,
    updates: Partial<{
      result: AnalysisResult['result'];
      input: AnalysisResult['input'];
    }>,
    userId?: string
  ) {
    try {
      if (!id || id.startsWith('local-')) {
        throw new Error('Valid analysis ID is required');
      }

      const { data, error } = await supabase
        .from('analysis_result')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating analysis:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception updating analysis:', error);
      return null;
    }
  }

  static async getAnalysisByUserId(userId: string, page: number = 1, limit: number = 20) {
    try {
      if (!userId) {
        console.warn('No user ID provided to getAnalysisByUserId');
        return { data: [], count: 0 };
      }

      // Calculate the range start based on page and limit
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // First get the count of all records for this user
      const { count, error: countError } = await supabase
        .from('analysis_result')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        console.error('Error counting user analyses from Supabase:', countError);
        return { data: [], count: 0 };
      }

      // Then get the paginated data
      const { data, error } = await supabase
        .from('analysis_result')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error getting user analyses from Supabase:', error);
        return { data: [], count: 0 };
      }

      // Validate and transform the data
      const validatedData = data.map(item => ({
        ...item,
        result: item.result || {},
        input: item.input || {},
      }));

      return { data: validatedData, count: count || 0 };
    } catch (error) {
      console.error('Exception getting user analyses from Supabase:', error);
      return { data: [], count: 0 };
    }
  }

  static async getAnalysisById(id: string, userId?: string) {
    try {
      // If it's a local ID, return null
      if (id.startsWith('local-')) {
        return null;
      }
      
      const query = supabase
        .from('analysis_result')
        .select('*')
        .eq('id', id);

      // If userId is provided, ensure the analysis belongs to the user
      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error getting analysis from Supabase:', error);
        return null;
      }

      // Validate and transform the data
      return {
        ...data,
        result: data.result || {},
        input: data.input || {},
      };
    } catch (error) {
      console.error('Exception getting analysis from Supabase:', error);
      return null;
    }
  }

  static async deleteAnalysis(id: string, userId?: string) {
    try {
      if (!id || id.startsWith('local-')) {
        return false;
      }

      const { error } = await supabase
        .from('analysis_result')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting analysis:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception deleting analysis:', error);
      return false;
    }
  }

  static async saveFeedback(
    analysisId: string,
    rating: number,
    comment?: string,
    userId?: string
  ) {
    try {
      console.log('SupabaseService.saveFeedback called with:', {
        analysisId,
        rating,
        hasComment: !!comment,
        hasUserId: !!userId
      });
      
      // Check if the analysisId is a local ID
      const isLocalId = analysisId.startsWith('local-');
      
      // Create the feedback object
      const feedbackData = {
        analysis_result_id: isLocalId ? null : analysisId,
        rating,
        comment,
        user_id: userId,
        created_at: new Date().toISOString()
      };

      console.log('Inserting feedback data:', feedbackData);

      const { data, error } = await supabase
        .from('feedback')
        .insert(feedbackData);

      if (error) {
        console.error('Error saving feedback to Supabase:', error);
        return { id: `local-feedback-${Date.now()}` };
      }

      return data || { id: `saved-feedback-${Date.now()}` };
    } catch (error) {
      console.error('Exception saving feedback to Supabase:', error);
      return { id: `local-feedback-${Date.now()}` };
    }
  }

  static async getFeedbackByAnalysisId(analysisId: string) {
    try {
      // If it's a local ID, return empty array
      if (analysisId.startsWith('local-')) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('analysis_result_id', analysisId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting feedback from Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception getting feedback from Supabase:', error);
      return [];
    }
  }

  static async getTrendingNews(): Promise<TrendingNews[]> {
    try {
      // Get more records to ensure we have enough unique items after deduplication
      const { data, error } = await supabase
        .from('analysis_result')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error getting trending news from Supabase:', error);
        return [];
      }

      // Group by content to remove duplicates and count occurrences
      const contentMap = new Map<string, {
        id: string;
        title: string;
        count: number;
        reliability: 'reliable' | 'suspicious';
        date: string;
        summary?: string;
      }>();

      data.forEach(item => {
        // Extract the text content - could be in text field or URL
        const contentText = (item.input.text || item.input.url || '').trim();
        
        // Skip if no content
        if (!contentText) return;
        
        // For grouping, use a normalized version of the content
        // This helps group similar content even with minor differences
        const normalizedContent = contentText.toLowerCase().slice(0, 50);
        
        if (contentMap.has(normalizedContent)) {
          // Increment count for existing content
          const existing = contentMap.get(normalizedContent)!;
          existing.count += 1;
          
          // Update date to most recent if this item is newer
          if (new Date(item.created_at) > new Date(existing.date)) {
            existing.date = item.created_at;
            existing.id = item.id; // Use the most recent ID
          }
          
          // We could potentially update reliability based on consensus
          contentMap.set(normalizedContent, existing);
        } else {
          // Add new content
          contentMap.set(normalizedContent, {
            id: item.id,
            title: contentText,
            count: 1,
            reliability: item.result.ISFAKE > 0.5 ? 'suspicious' : 'reliable',
            date: item.created_at,
            summary: item.result.EXPLANATION_EN || item.result.explanation
          });
        }
      });

      // Convert map to array, sort by count (descending), and take top 10
      const trendingNews: TrendingNews[] = Array.from(contentMap.values())
        .map(item => ({
          id: item.id,
          title: item.title,
          searchCount: item.count,
          reliability: item.reliability,
          date: item.date,
          summary: item.summary
        }))
        .sort((a, b) => b.searchCount - a.searchCount)
        .slice(0, 10);

      return trendingNews;
    } catch (error) {
      console.error('Exception getting trending news from Supabase:', error);
      return [];
    }
  }
} 