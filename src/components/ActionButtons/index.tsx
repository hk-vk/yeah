import { Copy, Share2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onCopy: () => void;
  onShare: () => void;
}

export function ActionButtons({ onCopy, onShare }: ActionButtonsProps) {
  const { language } = useLanguage();
  const currentTranslations = translations[language];

  return (
    <div className="flex items-center space-x-2">
      <motion.button
        onClick={onCopy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
        title={currentTranslations.copyButton || 'Copy'}
      >
        <Copy className="w-4 h-4" />
      </motion.button>
      <motion.button
        onClick={onShare}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
        title={currentTranslations.shareButton || 'Share'}
      >
        <Share2 className="w-4 h-4" />
      </motion.button>
    </div>
  );
} 