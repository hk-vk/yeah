import { API_CONFIG } from '../config';
import type { AnalysisResult, TextAnalysisResult, ImageAnalysisResult } from '../types/analysis';
import { SupabaseService } from './supabaseService';
import type { AnalysisType } from '../types/supabase';

// Create a persistent connection manager
class ConnectionManager {
    private static instance: ConnectionManager;
    private controller: AbortController;
    private keepAliveInterval: number;

    private constructor() {
        this.controller = new AbortController();
        this.keepAliveInterval = window.setInterval(() => this.pingServer(), 30000);
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
        window.clearInterval(this.keepAliveInterval);
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
            throw error;
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

    async analyzeUrl(url: string, userId?: string): Promise<TextAnalysisResult> {
        try {
            const response = await connectionManager.fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.URL_ANALYSIS}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                }
            );

            const result = await response.json();

            // Save analysis to Supabase and wait for it to complete
            try {
                const savedAnalysis = await saveAnalysisToSupabase(
                    'url',
                    { url },
                    result,
                    userId
                );
                return {
                    ...result,
                    id: savedAnalysis.id,
                    type: 'url'
                };
            } catch (error) {
                console.error('Error saving URL analysis:', error);
                return {
                    ...result,
                    id: `local-${Date.now()}`,
                    type: 'url'
                };
            }
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

    async searchReverseContent(content: string): Promise<any> {
        try {
            const response = await connectionManager.fetch(
                `${API_CONFIG.BASE_URL}/search/reverse`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Error performing reverse search:', error);
            throw error;
        }
    }
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

// Add cleanup on window unload
window.addEventListener('unload', () => {
    connectionManager.cleanup();
});