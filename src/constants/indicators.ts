import { IndicatorType } from '../types';

export const INDICATORS: Record<string, IndicatorType> = {
  sensationalism: {
    id: 'sensationalism',
    translations: {
      ml: {
        name: 'സെൻസേഷണലിസം',
        description: 'സെൻസേഷണൽ ഭാഷയുടെയും അമിത വികാര പ്രകടനത്തിന്റെയും അളവ്'
      },
      en: {
        name: 'Sensationalism',
        description: 'Measure of sensational language and emotional manipulation'
      }
    }
  },
  writingStyle: {
    id: 'writingStyle',
    translations: {
      ml: {
        name: 'എഴുത്ത് ശൈലി',
        description: 'വാർത്താ റിപ്പോർട്ടിംഗ് മാനദണ്ഡങ്ങളുമായുള്ള യോജിപ്പ്'
      },
      en: {
        name: 'Writing Style',
        description: 'Adherence to journalistic standards and writing conventions'
      }
    }
  },
  clickbait: {
    id: 'clickbait',
    translations: {
      ml: {
        name: 'ക്ലിക്ക്ബെയ്റ്റ് പാറ്റേണുകൾ',
        description: 'വായനക്കാരെ ആകർഷിക്കാനുള്ള അമിത ശ്രമങ്ങൾ'
      },
      en: {
        name: 'Clickbait Patterns',
        description: 'Presence of manipulative attention-grabbing techniques'
      }
    }
  },
  sourceCredibility: {
    id: 'sourceCredibility',
    translations: {
      ml: {
        name: 'ഉറവിട വിശ്വാസ്യത',
        description: 'വിവരങ്ങളുടെ ഉറവിടങ്ങളുടെ കൃത്യതയും വിശ്വാസ്യതയും'
      },
      en: {
        name: 'Source Credibility',
        description: 'Reliability and authenticity of information sources'
      }
    }
  }
};
