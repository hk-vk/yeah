import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { authTranslations } from './translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const { language } = useLanguage();
  const t = authTranslations[language];

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] p-4 flex items-center justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto backdrop-blur-md backdrop-filter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'login' ? t.login : t.signup}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4">
                {mode === 'login' ? (
                  <LoginForm onClose={onClose} />
                ) : (
                  <SignupForm onClose={onClose} />
                )}
              </div>

              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {mode === 'login' ? (
                  <>
                    {language === 'ml' ? 'അക്കൗണ്ട് ഇല്ലേ?' : "Don't have an account?"}{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {t.signup}
                    </button>
                  </>
                ) : (
                  <>
                    {language === 'ml' ? 'അക്കൗണ്ട് ഉണ്ടോ?' : 'Already have an account?'}{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {t.login}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}