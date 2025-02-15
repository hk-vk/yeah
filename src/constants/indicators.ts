import { IndicatorType } from '../types';

export const INDICATORS: Record<string, IndicatorType> = {
  sensationalism: {
    id: 'sensationalism',
    translations: {
      en: {
        name: 'Sensationalism',
        description: 'Measures the level of exaggerated or dramatic content'
      },
      ml: {
        name: 'അതിശയോക്തി',
        description: 'ഉള്ളടക്കത്തിന്റെ അതിശയോക്തി നിലവാരം അളക്കുന്നു'
      }
    }
  },
  writingStyle: {
    id: 'writingStyle',
    translations: {
      en: {
        name: 'Writing Quality',
        description: 'Assesses the overall quality and professionalism of the writing'
      },
      ml: {
        name: 'എഴുത്ത് ശൈലി',
        description: 'എഴുത്തിന്റെ പൊതുവായ ഗുണനിലവാരവും പ്രൊഫഷണലിസവും വിലയിരുത്തുന്നു'
      }
    }
  },
  clickbait: {
    id: 'clickbait',
    translations: {
      en: {
        name: 'Clickbait Score',
        description: 'Indicates the presence of clickbait tactics and misleading headlines'
      },
      ml: {
        name: 'ക്ലിക്ക്ബൈറ്റ് സ്കോർ',
        description: 'തെറ്റിദ്ധരിപ്പിക്കുന്ന തലക്കെട്ടുകളുടെയും ക്ലിക്ക്ബൈറ്റ് തന്ത്രങ്ങളുടെയും സാന്നിധ്യം സൂചിപ്പിക്കുന്നു'
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
