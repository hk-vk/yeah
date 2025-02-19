import { API_CONFIG } from '../config';

interface AnalysisResult {
  ISFAKE: number;
  CONFIDENCE: number;
  EXPLANATION: string;
}

interface WritingStyleResult {
  sensationalism: number;
  writingStyle: number;
  clickbait: number;
}

// Create a shared fetch client with connection pooling
const createFetchClient = () => {
  const controller = new AbortController();
  return {
    fetch: (url: string, options: RequestInit = {}) => {
      return fetch(url, {
        ...options,
        signal: controller.signal,
        keepalive: true,
        headers: {
          ...options.headers,
          'Connection': 'keep-alive',
        },
      });
    },
    abort: () => controller.abort(),
  };
};

const fetchClient = createFetchClient();

export const analyzeService = {
  async analyzeContent(content: string): Promise<AnalysisResult> {
    try {
      const response = await fetchClient.fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVERSE_SEARCH}`, {
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
  },

  async analyzeWritingStyle(content: string): Promise<WritingStyleResult> {
    try {
      const response = await fetchClient.fetch(`${API_CONFIG.BASE_URL}/api/writing-style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Writing style analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error during writing style analysis:', error);
      throw error;
    }
  }
};