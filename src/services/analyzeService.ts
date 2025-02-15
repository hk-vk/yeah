import { API_CONFIG } from '../config';

interface AnalysisResult {
  ISFAKE: number;
  CONFIDENCE: number;
  EXPLANATION: string;
}

export const analyzeService = {
  async analyzeContent(content: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVERSE_SEARCH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error during content analysis:', error);
      throw error;
    }
  }
};