import { API_CONFIG } from '../config';
import { AnalysisResult, WritingStyleResult } from '../types';

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

export const analyzeService = {
    async analyzeContent(content: string): Promise<AnalysisResult> {
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

            return await response.json();
        } catch (error) {
            console.error('Error during content analysis:', error);
            throw error;
        }
    },

    async analyzeWritingStyle(content: string): Promise<WritingStyleResult> {
        try {
            const response = await connectionManager.fetch(
                `${API_CONFIG.BASE_URL}/api/writing-style`,
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
            console.error('Error during writing style analysis:', error);
            throw error;
        }
    }
};

// Add cleanup on window unload
window.addEventListener('unload', () => {
    connectionManager.cleanup();
});