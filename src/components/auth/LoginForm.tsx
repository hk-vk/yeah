import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { authTranslations } from './translations';
import clsx from 'clsx';

interface LoginFormProps {
  onClose: () => void;
}

interface ValidationErrors {
  email: string;
  password: string;
}

export function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    email: '',
    password: ''
  });
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const { signIn, loading: isLoading } = useAuth();
  const { language } = useLanguage();
  const t = authTranslations[language];
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Validate email in real-time
  useEffect(() => {
    if (email === '') {
      setIsEmailValid(null);
      return;
    }
    
    const isValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
    setIsEmailValid(isValid);
    
    if (!isValid) {
      setValidationErrors(prev => ({
        ...prev,
        email: language === 'ml' ? 'സാധുവായ ഇമെയിൽ നൽകുക' : 'Invalid email address'
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  }, [email, language]);

  // Validate password in real-time
  useEffect(() => {
    if (password === '') {
      setIsPasswordValid(null);
      return;
    }
    
    const isValid = password.length >= 6;
    setIsPasswordValid(isValid);
    
    if (!isValid) {
      setValidationErrors(prev => ({
        ...prev,
        password: language === 'ml' ? 'പാസ്‌വേഡ് 6 അക്ഷരങ്ങളെങ്കിലും ഉണ്ടായിരിക്കണം' : 'Password must be at least 6 characters'
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  }, [password, language]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      email: '',
      password: ''
    };
    let isValid = true;

    // Email validation
    if (!email) {
      errors.email = language === 'ml' ? 'ഇമെയിൽ നൽകേണ്ടതാണ്' : 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = language === 'ml' ? 'സാധുവായ ഇമെയിൽ നൽകുക' : 'Invalid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = language === 'ml' ? 'പാസ്‌വേഡ് നൽകേണ്ടതാണ്' : 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = language === 'ml' ? 'പാസ്‌വേഡ് 6 അക്ഷരങ്ങളെങ്കിലും ഉണ്ടായിരിക്കണം' : 'Password must be at least 6 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError(null);
      await signIn(email, password);
      onClose(); // Call onClose after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loginError);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }

    // Clear general error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <motion.form
      ref={formRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.email}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            className={clsx(
              "pl-10 pr-10 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400",
              isEmailValid === false
                ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400"
                : isEmailValid === true
                  ? "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            )}
            placeholder={t.emailPlaceholder}
            required
          />
          {isEmailValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isEmailValid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {validationErrors.email && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {validationErrors.email}
          </motion.p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.password}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleInputChange}
            className={clsx(
              "pl-10 pr-10 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400",
              isPasswordValid === false
                ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400"
                : isPasswordValid === true
                  ? "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            )}
            placeholder={t.passwordPlaceholder}
            required
          />
          {isPasswordValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPasswordValid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {validationErrors.password && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {validationErrors.password}
          </motion.p>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center text-red-600 text-sm"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{error}</span>
        </motion.div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !!validationErrors.email || !!validationErrors.password}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span>{t.loggingIn}</span>
          </div>
        ) : (
          t.login
        )}
      </Button>
    </motion.form>
  );
}
