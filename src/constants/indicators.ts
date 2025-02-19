import { IndicatorType } from '../types';

export const INDICATORS: Record<string, IndicatorType> = {
  sensationalism: {
    id: 'sensationalism',
    translations: {
      en: {
        name: 'Sensationalism',
        description: 'Measures how exaggerated or dramatic the content is'
      },
      ml: {
        name: 'അതിശയോക്തി',
        description: 'ഉള്ളടക്കം എത്രമാത്രം നാടകീയമാണെന്ന് അളക്കുന്നു'
      }
    }
  },
  writingStyle: {
    id: 'writingStyle',
    translations: {
      en: {
        name: 'Writing Quality',
        description: 'Measures the overall quality and professionalism of the writing'
      },
      ml: {
        name: 'എഴുത്ത് നിലവാരം',
        description: 'എഴുത്തിന്റെ മൊത്തത്തിലുള്ള ഗുണനിലവാരവും പ്രൊഫഷണൽ സ്വഭാവവും അളക്കുന്നു'
      }
    }
  },
  clickbait: {
    id: 'clickbait',
    translations: {
      en: {
        name: 'Clickbait Score',
        description: 'Detects misleading headlines and attention-grabbing tactics'
      },
      ml: {
        name: 'ക്ലിക്ക്ബൈറ്റ് സ്കോർ',
        description: 'തെറ്റിദ്ധരിപ്പിക്കുന്ന തലക്കെട്ടുകളും ശ്രദ്ധ നേടാനുള്ള തന്ത്രങ്ങളും കണ്ടെത്തുന്നു'
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
