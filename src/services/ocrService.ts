import { createWorker, RecognizeResult } from 'tesseract.js';

interface OcrResult {
  text: string;
  confidence: number;
}

class OcrService {
  private worker: any = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  // Initialize the OCR worker with the specified languages
  private async initializeWorker(languages = ['eng', 'mal']) {
    if (this.worker || this.isInitializing) {
      return this.initPromise;
    }

    this.isInitializing = true;
    
    this.initPromise = new Promise<void>(async (resolve) => {
      try {
        console.log('Initializing OCR worker...');
        // Remove the logger to prevent cloning functions
        this.worker = await createWorker();
        
        await this.worker.loadLanguage(languages.join('+'));
        await this.worker.initialize(languages.join('+'));
        console.log('OCR worker initialized successfully');
        resolve();
      } catch (error) {
        console.error('Failed to initialize OCR worker:', error);
        this.worker = null;
        resolve();
      } finally {
        this.isInitializing = false;
      }
    });
    
    return this.initPromise;
  }

  // Detect text from an image
  async detectText(imageData: string): Promise<OcrResult> {
    try {
      await this.initializeWorker();
      
      if (!this.worker) {
        throw new Error('OCR worker could not be initialized');
      }

      // Handle the image data properly
      const result: RecognizeResult = await this.worker.recognize(imageData);
      const text = result.data.text.trim();
      const confidence = result.data.confidence;
      
      return { 
        text: text || '', 
        confidence: confidence || 0 
      };
    } catch (error) {
      console.error('Text detection failed:', error);
      // Return empty result on error instead of throwing
      return {
        text: '',
        confidence: 0
      };
    }
  }

  // Terminate the worker when not needed anymore
  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (error) {
        console.error('Error terminating worker:', error);
      }
      this.worker = null;
    }
  }
}

// Create a singleton instance
const ocrService = new OcrService();

// Clean up worker on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    ocrService.terminate();
  });
}

export { ocrService, type OcrResult };