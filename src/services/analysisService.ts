import { API_CONFIG } from '../config';
import { AnalysisResult } from '../types';

interface AnalysisRequest {
  query: string;
}

interface AnalysisResponse {
  ISFAKE: number;
  CONFIDENCE: number;
  EXPLANATION: string;
}

/**
 * Analyzes Malayalam text using the reverse-searchy API
 * @param text Malayalam text to analyze
 */
export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVERSE_SEARCH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to analyze text');
    }

    const data = await response.json();
    
    // Return raw response as is since backend handles proper JSON formatting
    return data;
  } catch (error) {
    console.error('Text analysis error:', error);
    throw error;
  }
};

export const submitAnalysisRequest = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/reverse-searchy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit analysis request');
    }

    const result = await response.json();
    return 'result' in result ? result.result : result;
  } catch (error) {
    console.error('Analysis request error:', error);
    throw error;
  }
};
