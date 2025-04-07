import { API_CONFIG } from '../config';
import type { AnalysisResult, TextAnalysisResult, ImageAnalysisResult } from '../types/analysis';
import type { WritingStyleResult } from '../types';
import { SupabaseService } from './supabaseService';
import type { AnalysisType } from '../types/supabase';
import { exaService } from './exaService';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // Corrected import path
import { imageService } from './imageService';

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
            console.log('Starting image analysis with:', { imageUrl, hasText: !!text });
            
            let imageBlob: Blob | undefined;
            let formData = new FormData();
            
            if (imageUrl.startsWith('data:')) {
                imageBlob = dataURLtoBlob(imageUrl);
                formData.append('image', imageBlob);
            } else if (imageUrl.startsWith('http')) {
                formData.append('url', imageUrl);
            }

            if (text) {
                formData.append('text', text);
            }

            console.log('Sending request to image analysis endpoint');
            const response = await fetch('https://settling-presently-giraffe.ngrok-free.app/analyze', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`Image analysis failed with status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Image analysis result:', result);

            // --- Revert to Synchronous Saving --- 
            try {
                console.log('Attempting to save analysis to Supabase...');
                const savedAnalysis = await saveAnalysisToSupabase(
                    text ? 'text_image' : 'image',
                    {
                        // Save simplified input as per previous version
                        image_url: 'image_processed', 
                        text: text,
                    },
                    result, 
                    userId
                );
                console.log('Successfully saved analysis to Supabase. ID:', savedAnalysis.id);

                // Store the image in Supabase (still potentially async, but after main save)
                try {
                   console.log('Attempting to store image...');
                   if (imageBlob) {
                       // --- Temporarily Commented Out Image Saving ---
                       await imageService.uploadImage(
                           imageBlob,
                           savedAnalysis.id,
                           'uploaded'
                       );
                       // --- End of Temporarily Commented Out Code ---
                   } else if (imageUrl.startsWith('http')) {
                       // --- Temporarily Commented Out Image Saving ---
                       await imageService.storeImageUrl(
                           imageUrl,
                           savedAnalysis.id,
                           'url'
                       );
                       // --- End of Temporarily Commented Out Code ---
                   }
                   console.log('Successfully stored image.');
                } catch (imageStorageError) {
                   console.error('Error storing image:', imageStorageError);
                   // Proceed even if image storage fails
                }
                
                // Return result combined with Supabase ID, NO input field
                return {
                    ...result,
                    id: savedAnalysis.id,
                    type: text ? 'text_image' : 'image'
                    // input field removed
                };

            } catch (saveError) {
                console.error('Error saving image analysis to Supabase:', saveError);
                // If saving fails, return result with a local ID
                return {
                    ...result,
                    id: `local-${Date.now()}`,
                    type: text ? 'text_image' : 'image'
                    // input field removed
                };
            }
            // --- End of Reverted Logic ---

        } catch (error) {
            console.error('Error during image analysis fetch:', error);
            // Return an error structure if the fetch itself fails
            const errorResult: ImageAnalysisResult = {
                verdict: 'Error',
                score: 0,
                details: { ai_generated: false, reverse_search: { found: false }, deepfake: false, tampering_analysis: false, image_caption: '' },
                id: `error-${Date.now()}`,
                type: text ? 'text_image' : 'image',
                error: error instanceof Error ? error.message : 'Unknown analysis error'
            };
            // We need to cast because the base type doesn't strictly require `error`
            return errorResult as ImageAnalysisResult; 
        }
    },

    async analyzeUrl(url: string, userId?: string): Promise<TextAnalysisResult> {
        try {
            console.log('Analyzing URL using Exa API:', url);
            
            // First call the specialized URL analysis endpoint
            let urlAnalysisData = null;
            try {
                // Call the URL analysis endpoint
                const urlAnalysisResponse = await connectionManager.fetch(
                    `${API_CONFIG.BASE_URL}/api/analyze-url`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url }),
                    }
                );
                
                if (urlAnalysisResponse.ok) {
                    urlAnalysisData = await urlAnalysisResponse.json();
                    console.log('URL analysis data:', urlAnalysisData);
                }
            } catch (urlAnalysisError) {
                console.error('Error fetching URL analysis data:', urlAnalysisError);
            }

            // Extract content using Exa
            const extractedContent = await exaService.extractUrlContent(url);
            console.log('Extracted content:', extractedContent);

            // Get image URL from extracted content
            const imageUrl = extractedContent.image;
            let imageAnalysisResult = null;

            // If an image URL was extracted, analyze it
            if (imageUrl && imageUrl.length > 10) {
                console.log('Analyzing image from URL:', imageUrl);
                try {
                    imageAnalysisResult = await this.analyzeImage(imageUrl, extractedContent.text, userId);
                    console.log('Image analysis result from URL image:', imageAnalysisResult);
                } catch (imageAnalysisError) {
                    console.error('Error analyzing image from URL:', imageAnalysisError);
                }
            }

            // Analyze the extracted text
            let textAnalysisResult = null;
            try {
                const response = await connectionManager.fetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVERSE_SEARCH}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            content: extractedContent.text,
                            timestamp: extractedContent.publishedDate
                        }),
                    }
                );

                if (response.ok) {
                    textAnalysisResult = await response.json();
                    console.log('Text analysis result:', textAnalysisResult);
                }
            } catch (textAnalysisError) {
                console.error('Error analyzing extracted text:', textAnalysisError);
            }

            // Save URL analysis to Supabase
            let savedAnalysis;
            try {
                savedAnalysis = await saveAnalysisToSupabase(
                    'url',
                    { 
                        url,
                        title: extractedContent.title,
                        published_date: extractedContent.publishedDate,
                        image_url: imageUrl || null
                    },
                    { 
                        ...textAnalysisResult,
                        urlAnalysis: urlAnalysisData,
                        imageAnalysis: imageAnalysisResult,
                        content: extractedContent.text,
                        image: extractedContent.image
                    },
                    userId
                );
            } catch (error) {
                console.error('Error saving URL analysis:', error);
                savedAnalysis = { id: `local-${Date.now()}` };
            }

            // Handle image storage if images are present
            if (urlAnalysisData?.images?.length > 0) {
                try {
                    // Store each image from the URL analysis
                    for (const image of urlAnalysisData.images) {
                        if (image.url) {
                            await imageService.storeImageUrl(
                                image.url,
                                savedAnalysis.id,
                                'extracted'
                            );
                        }
                    }
                } catch (imageError) {
                    console.error('Error storing URL images:', imageError);
                    // Continue with the analysis even if image storage fails
                }
            }

            return {
                ...textAnalysisResult,
                id: savedAnalysis.id,
                type: 'url',
                urlAnalysis: urlAnalysisData,
                imageAnalysis: imageAnalysisResult,
                input: {
                    url,
                    title: extractedContent.title,
                    published_date: extractedContent.publishedDate,
                    image_url: imageUrl || null
                }
            };
        } catch (error) {
            console.error('Error during URL analysis:', error);
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

    async saveAnalysisForSharing(analysisData: {
        textAnalysis: TextAnalysisResult | null;
        imageAnalysis: ImageAnalysisResult | null;
        urlAnalysis: any | null;
    }): Promise<string> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/analysis/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysisData),
            });

            if (!response.ok) {
                throw new Error('Failed to save analysis for sharing');
            }

            const data = await response.json();
            return data.analysisId;
        } catch (error) {
            console.error('Error saving analysis for sharing:', error);
            throw error;
        }
    },

    // Updated function to fetch analysis directly from Supabase by ID
    async getSharedAnalysis(analysisId: string): Promise<{
        textAnalysis: TextAnalysisResult | null;
        imageAnalysis: ImageAnalysisResult | null;
        urlAnalysis: any | null;
        input: any | null;
    } | null> {
        if (!analysisId) {
            console.error('getSharedAnalysis: No analysis ID provided');
            return null;
        }

        try {
            // Fetch analysis data
            const { data, error } = await supabase
                .from('analysis_result')
                .select('result, type, input')
                .eq('id', analysisId)
                .single();

            if (error) {
                throw error;
            }

            if (!data || !data.result || !data.type) {
                return null;
            }

            // Fetch associated images
            const images = await imageService.getAnalysisImages(analysisId);
            console.log('Fetched images for analysis:', images);
            
            // Get image URLs
            const imageUrls = await Promise.all(
                images.map(async img => {
                    if (img.storage_path) {
                        try {
                            const url = await imageService.getImageUrl(img.storage_path);
                            return {
                                url,
                                type: img.image_type
                            };
                        } catch (err) {
                            console.error('Error getting storage URL:', err);
                            return null;
                        }
                    } else if (img.original_url) {
                        return {
                            url: img.original_url,
                            type: img.image_type
                        };
                    }
                    return null;
                })
            );
            
            // Filter out any null values and format the input
            const validImageUrls = imageUrls.filter(Boolean);
            console.log('Valid image URLs:', validImageUrls);
            
            // Format the result
            const analysisResult = data.result;
            const analysisType = data.type as AnalysisType;
            const analysisInput = {
                ...data.input,
                images: validImageUrls
            };

            let formattedResult = {
                textAnalysis: null,
                imageAnalysis: null,
                urlAnalysis: null,
                input: analysisInput
            };

            if (analysisType === 'text' || analysisType === 'url') {
                formattedResult.textAnalysis = {
                    ...analysisResult,
                    id: analysisId,
                    type: analysisType
                };
                formattedResult.urlAnalysis = analysisResult.urlAnalysis || null;
            } else if (analysisType === 'image' || analysisType === 'text_image') {
                // For image analysis, ensure we have the image URL in both places
                const imageUrl = validImageUrls[0]?.url || data.input?.image_url;
                formattedResult.imageAnalysis = {
                    ...analysisResult,
                    id: analysisId,
                    type: analysisType,
                    imageUrl // Add the image URL directly to the analysis result
                };
                
                // If this is a text_image analysis, also set the text analysis
                if (analysisType === 'text_image' && analysisResult.textAnalysis) {
                    formattedResult.textAnalysis = {
                        ...analysisResult.textAnalysis,
                        id: analysisId,
                        type: 'text'
                    };
                }
            }

            console.log('Formatted shared analysis result:', formattedResult);
            return formattedResult;
        } catch (error) {
            console.error('Error in getSharedAnalysis:', error);
            return null;
        }
    },
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
        CONFIDENCE: 0.6 + Math.random() * 0.2,
        EXPLANATION_EN: isFake 
            ? "The content shows signs of sensationalism and may contain unreliable information."
            : "The content appears to be reliable based on initial analysis.",
        EXPLANATION_ML: isFake
            ? "ഉള്ളടക്കത്തിൽ സെൻസേഷണലിസത്തിന്റെ ലക്ഷണങ്ങൾ കാണിക്കുന്നു, വിശ്വസനീയമല്ലാത്ത വിവരങ്ങൾ അടങ്ങിയിരിക്കാം."
            : "പ്രാഥമിക വിശകലനത്തിന്റെ അടിസ്ഥാനത്തിൽ ഉള്ളടക്കം വിശ്വസനീയമാണ്.",
        ISFAKE: isFake
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