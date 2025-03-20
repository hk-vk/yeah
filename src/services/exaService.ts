import Exa from 'exa-js';

// Initialize Exa client with API key from environment variables
const EXA_API_KEY = import.meta.env.VITE_EXA_API_KEY;
if (!EXA_API_KEY) {
  throw new Error('EXA_API_KEY environment variable is not set');
}
const exa = new Exa(EXA_API_KEY);

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
      console.log('Attempting to extract content from URL:', url);

      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        console.error('Invalid URL format:', e);
        throw new Error('Invalid URL format: Please make sure your URL includes http:// or https://');
      }

      // Call Exa API to get contents
      try {
        const result = await exa.getContents(
          [url],
          {
            text: true
          }
        ) as ExaApiResponse;
        
        console.log('Exa API response:', result);

        // Check if we have results
        if (result?.results && result.results.length > 0) {
          const content = result.results[0];
          
          // Log extracted content for debugging
          console.log('Extracted content:', {
            hasText: !!content.text,
            textLength: content.text?.length,
            hasImage: !!content.image,
            hasTitle: !!content.title,
            hasAuthor: !!content.author,
            hasFavicon: !!content.favicon
          });

          // If we have text content, return it
          if (content.text && content.text.trim().length > 0) {
            return {
              text: content.text,
              image: content.image || undefined,
              title: content.title || undefined,
              url: content.url || url,
              publishedDate: content.publishedDate || undefined,
              author: content.author || undefined,
              favicon: content.favicon || undefined
            };
          }

          // If no text content but we have title, use that as minimum content
          if (content.title) {
            return {
              text: content.title,
              image: content.image || undefined,
              title: content.title,
              url: content.url || url,
              publishedDate: content.publishedDate || undefined,
              author: content.author || undefined,
              favicon: content.favicon || undefined
            };
          }
        }
      } catch (exaError) {
        console.error('Exa API error:', exaError);
        throw new Error(`Request failed with status 400. Sorry, we had trouble finding contents for the given URL.`);
      }
      
      // If we couldn't extract content, try to fetch it directly
      try {
        const response = await fetch(url);
        const html = await response.text();
        // Extract text content from HTML (basic extraction)
        const textContent = html
          .replace(/<script\b[^<](?:(?!<\/script>)<[^<])*<\/script>/gi, '')
          .replace(/<style\b[^<](?:(?!<\/style>)<[^<])*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (textContent.length > 0) {
          return {
            text: textContent.substring(0, 1000), // Take first 1000 chars as fallback
            url: url
          };
        }
      } catch (fetchError) {
        console.error('Fallback content fetch failed:', fetchError);
      }
      
      console.error('No content could be extracted from URL:', url);
      throw new Error('No content could be extracted from URL');
    } catch (error) {
      console.error('Error extracting content from URL:', error);
      throw error; // Re-throw to handle in the calling function
    }
  }
};