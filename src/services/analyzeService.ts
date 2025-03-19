import { API_CONFIG } from '../config';
import type { AnalysisResult, TextAnalysisResult, ImageAnalysisResult } from '../types/analysis';
import type { WritingStyleResult } from '../types';
import { SupabaseService } from './supabaseService';
import type { AnalysisType } from '../types/supabase';
import { exaService } from './exaService';
import { createClient } from '@supabase/supabase-js';

// Create a persistent connection manager
class ConnectionManager {
    private static instance: ConnectionManager;
    private controller: AbortController;
    private keepAliveInterval: number = 0; // Initialize with default value

    private constructor() {
        this.controller = new AbortController();
        // Disable the keepalive for now since the backend is not available
        // this.keepAliveInterval = window.setInterval(() => this.pingServer(), 30000);
    }

    static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const fetchOptions: RequestInit = {
            ...options,
            signal: this.controller.signal,
            keepalive: true,
            headers: {
                ...options.headers,
                'Connection': 'keep-alive',
                'Keep-Alive': 'timeout=120'
            },
        };

        try {
            // Log for debugging
            console.log(`Attempting to fetch from URL: ${url}`);
            
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                throw new Error(`Request failed: ${response.statusText}`);
            }
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    private async pingServer(): Promise<void> {
        try {
            await this.fetch(`${API_CONFIG.BASE_URL}/`);
        } catch (error) {
            console.warn('Keep-alive ping failed:', error);
        }
    }

    cleanup(): void {
        this.controller.abort();
        if (this.keepAliveInterval) {
            window.clearInterval(this.keepAliveInterval);
        }
    }
}

// Initialize connection manager
const connectionManager = ConnectionManager.getInstance();

// Helper function to save analysis to Supabase
const saveAnalysisToSupabase = async (type: AnalysisType, input: any, result: any, userId?: string) => {
    console.log('saveAnalysisToSupabase called with userId:', userId);
    
    try {
        const savedAnalysis = await SupabaseService.saveAnalysis(type, input, result, userId);
        return savedAnalysis;
    } catch (error) {
        console.error('Error in saveAnalysisToSupabase:', error);
        // Return a mock ID if saving fails
        return { id: `local-${Date.now()}` };
    }
};

interface AnalyzeResponse {
  verdict: string;
  score: number;
  details: {
    ai_generated: boolean;
    reverse_search: {
      found: boolean;
      matches?: Array<{
        url: string;
        title: string;
      }>;
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
      reverse_search?: {
        found: boolean;
        matches?: Array<{
          url: string;
          title: string;
        }>;
        reliability_score?: number;
      };
    };
    date_analysis?: {
      image_dates: string[];
      text_dates: string[];
      match: boolean;
      similarity: number;
      mismatch: boolean;
    };
  };
}

interface ExtendedAnalysisResult extends AnalyzeResponse {
  type: "text" | "url" | "image" | "text_image";
  ISFAKE: number;
  CONFIDENCE: number;
  EXPLANATION_EN: string;
  EXPLANATION_ML: string;
}

export const analyzeService = {
    async analyzeContent(content: string, userId?: string): Promise<TextAnalysisResult> {
        try {
            // Check if content is a URL
            const isUrl = isValidUrl(content);
            
            if (isUrl) {
                // If content is a URL, use analyzeUrl instead
                return await this.analyzeUrl(content, userId);
            }
            
            // Continue with text analysis if not a URL
            const response = await connectionManager.fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVERSE_SEARCH}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                }
            );

            const result = await response.json();

            // Save analysis to Supabase and wait for it to complete
            try {
                const savedAnalysis = await saveAnalysisToSupabase(
                    'text',
                    { text: content },
                    result,
                    userId
                );
                return {
                    ...result,
                    id: savedAnalysis.id,
                    type: 'text'
                };
            } catch (error) {
                console.error('Error saving text analysis:', error);
                return {
                    ...result,
                    id: `local-${Date.now()}`,
                    type: 'text'
                };
            }
        } catch (error) {
            console.error('Error during content analysis:', error);
            
            // Return a mock result if backend is unavailable
            const mockResult = createMockAnalysisResult(content);
            return {
                ...mockResult,
                id: `local-${Date.now()}`,
                type: 'text'
            };
        }
    },

    async analyzeImage(
        imageUrl: string,
        text?: string,
        userId?: string
    ): Promise<ImageAnalysisResult> {
        try {
            // Convert data URL to blob if needed
            let imageBlob;
            if (imageUrl.startsWith('data:')) {
                imageBlob = dataURLtoBlob(imageUrl);
            }

            const formData = new FormData();
            formData.append('image', imageBlob || imageUrl);
            if (text) {
                formData.append('text', text);
            }

            const response = await fetch('https://settling-presently-giraffe.ngrok-free.app/analyze', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`Image analysis failed with status: ${response.status}`);
            }

            const result = await response.json();

            // Save analysis to Supabase and wait for it to complete
            try {
                const savedAnalysis = await saveAnalysisToSupabase(
                    text ? 'text_image' : 'image',
                    {
                        image_url: 'image_processed', // Don't store the actual data URL
                        text: text,
                    },
                    result,
                    userId
                );
                return {
                    ...result,
                    id: savedAnalysis.id,
                    type: text ? 'text_image' : 'image'
                };
            } catch (error) {
                console.error('Error saving image analysis:', error);
                return {
                    ...result,
                    id: `local-${Date.now()}`,
                    type: text ? 'text_image' : 'image'
                };
            }
        } catch (error) {
            console.error('Error during image analysis:', error);
            throw error;
        }
    },

    /**
     * Analyze content from a URL
     * @param url The URL to analyze
     * @param text Optional text to analyze with the image
     */
    async analyzeUrl(url: string, text?: string): Promise<ExtendedAnalysisResult> {
        try {
            console.log('Starting URL analysis:', { url, text });

            // First extract content from URL using Exa API
            const extractedContent = await exaService.extractUrlContent(url);
            console.log('Content extracted from URL:', extractedContent);

            if (!extractedContent.image) {
                console.error('No image found in the URL content');
                throw new Error('No image found in the URL content');
            }

            // Now analyze the extracted image
            const result = await this.analyzeImage(extractedContent.image, text || extractedContent.text);
            
            // Add compatibility fields for TextAnalysisResult
            const analysisResult: ExtendedAnalysisResult = {
                ...result,
                type: "text_image",
                ISFAKE: result.verdict.toLowerCase().includes('fake') ? 1 : 0,
                CONFIDENCE: result.score,
                EXPLANATION_EN: `Analysis of content from ${url}. ${result.verdict === 'fake' ? 'The content shows signs of manipulation.' : 'The content appears to be authentic.'}`,
                EXPLANATION_ML: `${url} നിന്നുള്ള ഉള്ളടക്കത്തിന്റെ വിശകലനം. ${result.verdict === 'fake' ? 'ഉള്ളടക്കത്തിൽ കൃത്രിമത്വത്തിന്റെ ലക്ഷണങ്ങൾ കാണിക്കുന്നു.' : 'ഉള്ളടക്കം യഥാർത്ഥമാണെന്ന് തോന്നുന്നു.'}`
            };

            return analysisResult;
        } catch (error) {
            console.error('Error in URL analysis:', error);
            throw error;
        }
    },

    async saveFeedback(analysisId: string, rating: number, comment?: string, userId?: string) {
        console.log('analyzeService.saveFeedback called with:', {
            analysisId,
            rating,
            hasComment: !!comment,
            hasUserId: !!userId
        });
        
        try {
            return await SupabaseService.saveFeedback(analysisId, rating, comment, userId);
        } catch (error) {
            console.error('Error saving feedback:', error);
            throw error;
        }
    },

    async searchReverseContent(content: string, timestamp?: string): Promise<any> {
        try {
            const payload = timestamp 
                ? { content, timestamp } 
                : { content };
                
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/reverse-searchy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to perform reverse search');
            }

            const result = await response.json();
            const data = 'result' in result ? result.result : result;
            
            // Add explanations to the response
            if (data.matches && data.matches.length > 0) {
                data.matches = data.matches.map((match: any) => ({
                    ...match,
                    explanation_ml: match.explanation_ml || 'വിശദീകരണം ലഭ്യമല്ല',
                    explanation_en: match.explanation_en || 'No explanation available'
                }));
            }
            
            return data;
        } catch (error: unknown) {
            console.error('Error performing reverse search:', error instanceof Error ? error.message : String(error));
            // Return empty matches array in case of error
            return { matches: [] };
        }
    },

    async analyzeWritingStyle(content: string): Promise<WritingStyleResult> {
        try {
            console.log('Analyzing writing style for content length:', content.length);
            
            // Try to use the backend
            try {
                // Use direct fetch to localhost:8000 instead of connectionManager
                const response = await fetch('http://localhost:8000/api/writing-style', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                });

                if (!response.ok) {
                    throw new Error(`Writing style analysis failed with status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Writing style API response:', result);
                
                // Use the actual API response instead of hardcoded values
                if (result && typeof result === 'object') {
                    // Check if the response has the expected properties
                    const writingStyleResult: WritingStyleResult = {
                        sensationalism: typeof result.sensationalism === 'number' ? result.sensationalism : 65,
                        writingStyle: typeof result.writingStyle === 'number' ? result.writingStyle : 75,
                        clickbait: typeof result.clickbait === 'number' ? result.clickbait : 45
                    };
                    
                    console.log('Using API writing style values:', writingStyleResult);
                    return writingStyleResult;
                } else {
                    console.warn('API response does not contain expected data:', result);
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                console.warn('Backend not available for writing style analysis, generating mock result:', error);
                
                // Simple algorithm to generate somewhat meaningful mock values
                const contentLength = content.length;
                const exclamationCount = (content.match(/!/g) || []).length;
                const questionCount = (content.match(/\?/g) || []).length;
                const capsCount = (content.match(/[A-Z]{3,}/g) || []).length;
                
                const sensationalism = Math.min(
                    80, 
                    20 + (exclamationCount * 10) + (questionCount * 5) + (capsCount * 15)
                );
                const clickbait = Math.min(
                    80,
                    15 + (questionCount * 8) + (exclamationCount * 7)
                );
                const writingStyle = Math.min(
                    90,
                    50 + (contentLength > 500 ? 30 : contentLength / 20)
                );
                
                const mockResult = {
                    sensationalism,
                    writingStyle,
                    clickbait
                };
                
                console.log('Generated mock writing style result:', mockResult);
                return mockResult;
            }
        } catch (error) {
            console.error('Error during writing style analysis:', error);
            
            // Return default values in case of any error
            return {
                sensationalism: 50,
                writingStyle: 50,
                clickbait: 50
            };
        }
    },

    /**
     * Analyze an image directly
     * @param imageData The image data (URL or File)
     * @param text Optional text to analyze with the image
     */
    async analyzeImage(imageData: string | File, text?: string): Promise<ExtendedAnalysisResult> {
        try {
            console.log('Starting image analysis:', { hasImage: !!imageData, hasText: !!text });

            const formData = new FormData();
            
            // Handle both URL and File inputs
            if (typeof imageData === 'string') {
                formData.append('url', imageData);
            } else {
                formData.append('image', imageData);
            }

            if (text) {
                formData.append('text', text);
            }

            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Analysis API error:', error);
                throw new Error(error.error || 'Analysis failed');
            }

            const result = await response.json() as AnalyzeResponse;
            console.log('Analysis result:', result);

            // Add compatibility fields for TextAnalysisResult
            const analysisResult: ExtendedAnalysisResult = {
                ...result,
                type: text ? "text_image" : "image",
                ISFAKE: result.verdict.toLowerCase().includes('fake') ? 1 : 0,
                CONFIDENCE: result.score,
                EXPLANATION_EN: result.verdict === 'fake' 
                    ? 'The image shows signs of manipulation or AI generation.' 
                    : 'The image appears to be authentic.',
                EXPLANATION_ML: result.verdict === 'fake'
                    ? 'ചിത്രത്തിൽ കൃത്രിമത്വത്തിന്റെയോ AI നിർമ്മാണത്തിന്റെയോ ലക്ഷണങ്ങൾ കാണിക്കുന്നു.'
                    : 'ചിത്രം യഥാർത്ഥമാണെന്ന് തോന്നുന്നു.'
            };

            return analysisResult;
        } catch (error) {
            console.error('Error in image analysis:', error);
            throw error;
        }
    }
};

// Helper function to create a mock analysis result when backend is unavailable
const createMockAnalysisResult = (content: string) => {
    // Simple algorithm to generate a mock analysis
    const contentLength = content.length;
    const exclamationCount = (content.match(/!/g) || []).length;
    const questionCount = (content.match(/\?/g) || []).length;
    const capsCount = (content.match(/[A-Z]{3,}/g) || []).length;
    
    // Calculate a "fake score" based on these factors
    const fakeScore = (exclamationCount * 0.1) + (questionCount * 0.05) + (capsCount * 0.15);
    const isFake = fakeScore > 0.5 ? 1 : 0;
    
    return {
        verdict: isFake ? 'fake' : 'reliable',
        score: isFake ? 0.5 : 0.9,
        details: {
            ai_generated: false,
            reverse_search: {
                found: false,
                matches: []
            },
            deepfake: false,
            tampering_analysis: false,
            image_caption: '',
            text_analysis: {
                user_text: '',
                extracted_text: '',
                mismatch: false,
                context_similarity: 0,
                context_mismatch: false,
                reverse_search: {
                    found: false,
                    matches: [],
                    reliability_score: 0
                }
            },
            date_analysis: {
                image_dates: [],
                text_dates: [],
                match: false,
                similarity: 0,
                mismatch: false
            }
        }
    };
};

// Helper function to convert data URL to Blob
const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Helper function to validate URL format
const isValidUrl = (string: string): boolean => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// Add cleanup on window unload
window.addEventListener('unload', () => {
    connectionManager.cleanup();
});