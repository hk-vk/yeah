import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { cn } from '../../../../utils/cn';
import { useButtonAnimation } from './useButtonAnimation';
import { SuccessMessage } from './SuccessMessage';
import { ButtonIcon } from './ButtonIcon';
import { verificationButtonTranslations } from './translations';

interface VerificationButtonProps {
  onClick: () => Promise<void>;
  isDisabled?: boolean;
  className?: string;
}

export function VerificationButton({ 
  onClick, 
  isDisabled = false,
  className 
}: VerificationButtonProps) {
  const { isLoading, isSuccess, handleClick } = useButtonAnimation(onClick);
  const controls = useAnimation();
  const { language } = useLanguage();
  const t = verificationButtonTranslations[language];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={controls}
        disabled={isDisabled || isLoading}
        onClick={handleClick}
        className={cn(
          'relative overflow-hidden px-6 py-3 rounded-lg font-medium',
          'bg-gradient-to-r from-blue-600 to-indigo-600',
          'text-white shadow-lg shadow-blue-500/25',
          'transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'group',
          className
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div className="relative flex items-center space-x-2">
          <span className="relative z-10">{t.startVerification}</span>
          <ButtonIcon isLoading={isLoading} isSuccess={isSuccess} />
        </div>
      </motion.button>

      <SuccessMessage 
        isVisible={isSuccess} 
        message={t.verificationComplete}
      />
    </div>
  );
}
