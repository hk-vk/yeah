import Exa from 'exa-js';
import { API_CONFIG } from '../config'; // Added import for backend URL

// Initialize Exa client with API key from environment variables
// Remove direct Exa initialization as backend will handle it
// const EXA_API_KEY = import.meta.env.VITE_EXA_API_KEY;
// if (!EXA_API_KEY) {
//   throw new Error('EXA_API_KEY environment variable is not set');
// }
// const exa = new Exa(EXA_API_KEY);

// Define types for Exa API response based on actual response format
interface ExaContentResponse {
  id?: string;
  text?: string;
  image?: string;
  title?: string;
  url?: string;
  publishedDate?: string;
  author?: string;
  favicon?: string;
}

interface ExaApiResponse {
  results: ExaContentResponse[];
  requestId: string;
  costDollars: {
    total: number;
    contents: Record<string, number>;
  };
}

export interface ExaContentResult {
  text: string;
  image?: string;
  title?: string;
  url: string;
  publishedDate?: string;
  author?: string;
  favicon?: string;
}

export const exaService = {
  /**
   * Extract content from a URL using Exa AI
   * @param url The URL to extract content from
   * @returns Promise with extracted text and image
   */
  async extractUrlContent(url: string): Promise<ExaContentResult> {
    try {
      console.log('Attempting to extract content via backend proxy for URL:', url);

      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        console.error('Invalid URL format:', e);
        throw new Error('Invalid URL format: Please make sure your URL includes http:// or https://');
      }

      // Call the backend proxy endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/exa-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        // Attempt to read error details from backend response
        let errorDetails = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorDetails = errorData.error;
          }
        } catch (jsonError) {
          // Ignore if response is not JSON
          console.warn('Could not parse error response JSON:', jsonError);
        }
        console.error('Backend proxy error:', response.status, errorDetails);
        throw new Error(`Error fetching content: ${errorDetails}`);
      }

      const result = await response.json();
      console.log('Backend proxy response:', result);

      // Check if we have data and results in the expected structure
      if (result?.data?.results && result.data.results.length > 0) {
        const content = result.data.results[0];

        // Log extracted content for debugging
        console.log('Extracted content from proxy:', {
          hasText: !!content.text,
          textLength: content.text?.length,
          hasImage: !!content.image,
          hasTitle: !!content.title,
          hasAuthor: !!content.author,
          hasFavicon: !!content.favicon
        });

        // Ensure we have at least some text or a title
        if ((content.text && content.text.trim().length > 0) || content.title) {
          return {
            text: content.text || content.title || '', // Use title as fallback if text is empty
            image: content.image || undefined,
            title: content.title || undefined,
            url: content.url || url,
            publishedDate: content.publishedDate || undefined,
            author: content.author || undefined,
            favicon: content.favicon || undefined
          };
        } else {
          console.error('No usable text or title found in the response from proxy for URL:', url);
          throw new Error('No usable content (text or title) found in the response.');
        }
      } else {
         console.error('Unexpected response structure from backend proxy for URL:', url, result);
         throw new Error('Could not extract content: Unexpected response structure from server.');
      }

    } catch (error) {
      // Catch fetch errors or errors thrown explicitly
      console.error('Error extracting content via backend proxy:', error);
      // Re-throw a user-friendly error or the original error
      throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred while extracting content.');
    }
    // Removed the old fallback mechanism that tried fetching directly from the browser
  }
};