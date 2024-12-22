// src/components/auth/AuthButtons.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { authTranslations } from './translations';
import { AuthModal } from './AuthModal';
import { Button } from '../common/Button';
import { useTheme } from '../../contexts/ThemeContext';

export function AuthButtons() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = authTranslations[language];

  const handleOpenModal = (mode: 'login' | 'signup') => {
    setMode(mode);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={() => handleOpenModal('login')}
            className="flex items-center space-x-2"
          >
            <LogIn className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">{t.login}</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button
            variant="primary"
            onClick={() => handleOpenModal('signup')}
            className="flex items-center space-x-2"
          >
            <UserPlus className={`h-4 w-4 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
            <span className={`text-white ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{t.signup}</span>
          </Button>
        </motion.div>
      </div>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={mode}
      />
    </>
  );
}
