import { createWorker, Worker } from 'tesseract.js';

interface OcrResult {
  text: string;
  confidence: number;
  language?: string;
}

class OcrService {
  private mainWorker: Worker | null = null;
  private malayalamWorker: Worker | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private async createWorkerWithLanguage(lang: string): Promise<Worker> {
    const worker = await createWorker();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
    return worker;
  }

  private async initializeWorkers() {
    if ((this.mainWorker && this.malayalamWorker) || this.isInitializing) {
      return this.initPromise;
    }

    this.isInitializing = true;
    
    this.initPromise = new Promise<void>(async (resolve) => {
      try {
        console.log('Initializing OCR workers...');
        
        // Initialize workers in parallel
        const [mainWorker, malayalamWorker] = await Promise.all([
          this.createWorkerWithLanguage('eng'),
          this.createWorkerWithLanguage('mal')
        ]);

        this.mainWorker = mainWorker;
        this.malayalamWorker = malayalamWorker;

        // Configure workers
        await Promise.all([
          this.mainWorker.setParameters({
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: '6'
          }),
          this.malayalamWorker.setParameters({
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: '6',
            tessedit_enable_dict_correction: '1'
          })
        ]);

        console.log('OCR workers initialized successfully');
        resolve();
      } catch (error) {
        console.error('Failed to initialize OCR workers:', error);
        this.mainWorker = null;
        this.malayalamWorker = null;
        resolve();
      } finally {
        this.isInitializing = false;
      }
    });
    
    return this.initPromise;
  }

  private isMalayalamText(text: string): boolean {
    const malayalamRegex = /[\u0D00-\u0D7F]/;
    return malayalamRegex.test(text);
  }

  async detectText(imageData: string): Promise<OcrResult> {
    try {
      await this.initializeWorkers();
      
      if (!this.mainWorker || !this.malayalamWorker) {
        throw new Error('OCR workers could not be initialized');
      }

      // Try both workers in parallel
      const [engResult, malResult] = await Promise.all([
        this.mainWorker.recognize(imageData),
        this.malayalamWorker.recognize(imageData)
      ]);

      // Compare results and choose the better one
      let text = '';
      let confidence = 0;
      let language = 'eng';

      const engText = engResult.data.text.trim();
      const malText = malResult.data.text.trim();

      const hasMalayalam = this.isMalayalamText(malText);

      if (hasMalayalam && malResult.data.confidence > 35) {
        text = malText;
        confidence = malResult.data.confidence;
        language = 'mal';
      } else if (engResult.data.confidence > 50) {
        text = engText;
        confidence = engResult.data.confidence;
        language = 'eng';
      } else {
        // If neither result is confident enough, return the one with higher confidence
        if (malResult.data.confidence > engResult.data.confidence) {
          text = malText;
          confidence = malResult.data.confidence;
          language = 'mal';
        } else {
          text = engText;
          confidence = engResult.data.confidence;
          language = 'eng';
        }
      }

      // Clean up the text
      text = text
        .replace(/[\n\r]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        text,
        confidence,
        language
      };
    } catch (error) {
      console.error('Text detection failed:', error);
      return {
        text: '',
        confidence: 0,
        language: 'unknown'
      };
    }
  }

  async terminate() {
    try {
      if (this.mainWorker) {
        await this.mainWorker.terminate();
        this.mainWorker = null;
      }
      if (this.malayalamWorker) {
        await this.malayalamWorker.terminate();
        this.malayalamWorker = null;
      }
    } catch (error) {
      console.error('Error terminating workers:', error);
    }
  }
}

const ocrService = new OcrService();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    ocrService.terminate();
  });
}

export { ocrService, type OcrResult };