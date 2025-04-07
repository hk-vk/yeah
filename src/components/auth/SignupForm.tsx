import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { authTranslations } from './translations';
import clsx from 'clsx';

interface SignupFormProps {
  onClose: () => void;
}

interface ValidationErrors {
  name: string;
  email: string;
  password: string;
}

interface PasswordStrength {
  score: number; // 0-4
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export function SignupForm({ onClose }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: '',
    email: '',
    password: ''
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [isNameValid, setIsNameValid] = useState<boolean | null>(null);
  const { signUp, loading } = useAuth();
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

  // Validate name in real-time
  useEffect(() => {
    if (name === '') {
      setIsNameValid(null);
      return;
    }
    
    const isValid = name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
    setIsNameValid(isValid);
    
    if (!isValid) {
      if (name.length < 2) {
        setValidationErrors(prev => ({
          ...prev,
          name: language === 'ml' ? 'പേര് 2 അക്ഷരങ്ങളെങ്കിലും ഉണ്ടായിരിക്കണം' : 'Name must be at least 2 characters'
        }));
      } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        setValidationErrors(prev => ({
          ...prev,
          name: language === 'ml' ? 'പേരിൽ അക്ഷരങ്ങളും സ്പേസുകളും മാത്രമേ അനുവദനീയമാണ്' : 'Name can only contain letters and spaces'
        }));
      }
    } else {
      setValidationErrors(prev => ({ ...prev, name: '' }));
    }
  }, [name, language]);

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

  // Validate password strength in real-time
  useEffect(() => {
    if (password === '') {
      setPasswordStrength({
        score: 0,
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false
      });
      return;
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    // Calculate score (0-4)
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    
    setPasswordStrength({
      score,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber
    });
    
    if (!hasMinLength) {
      setValidationErrors(prev => ({
        ...prev,
        password: language === 'ml' ? 'പാസ്‌വേഡ് 8 അക്ഷരങ്ങളെങ്കിലും ഉണ്ടായിരിക്കണം' : 'Password must be at least 8 characters'
      }));
    } else if (!(hasUppercase && hasLowercase && hasNumber)) {
      setValidationErrors(prev => ({
        ...prev,
        password: language === 'ml' 
          ? 'പാസ്‌വേഡിൽ ഒരു വലിയ അക്ഷരം, ഒരു ചെറിയ അക്ഷരം, ഒരു അക്കം എന്നിവ ഉണ്ടായിരിക്കണം' 
          : 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  }, [password, language]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      name: '',
      email: '',
      password: ''
    };
    let isValid = true;

    // Name validation
    if (!name) {
      errors.name = language === 'ml' ? 'പേര് നൽകേണ്ടതാണ്' : 'Name is required';
      isValid = false;
    } else if (name.length < 2) {
      errors.name = language === 'ml' ? 'പേര് 2 അക്ഷരങ്ങളെങ്കിലും ഉണ്ടായിരിക്കണം' : 'Name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.name = language === 'ml' ? 'പേരിൽ അക്ഷരങ്ങളും സ്പേസുകളും മാത്രമേ അനുവദനീയമാണ്' : 'Name can only contain letters and spaces';
      isValid = false;
    }

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
    } else if (password.length < 8) {
      errors.password = language === 'ml' ? 'പാസ്‌വേഡ് 8 അക്ഷരങ്ങളെങ്കിലും ഉണ്ടായിരിക്കണം' : 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = language === 'ml' 
        ? 'പാസ്‌വേഡിൽ ഒരു വലിയ അക്ഷരം, ഒരു ചെറിയ അക്ഷരം, ഒരു അക്കം എന്നിവ ഉണ്ടായിരിക്കണം' 
        : 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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
      await signUp(email, password, name);
      onClose(); // Call onClose after successful signup
    } catch (err) {
      setError(err instanceof Error ? err.message : t.signupError);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.target;
    if (fieldName === 'email') {
      setEmail(value);
    } else if (fieldName === 'password') {
      setPassword(value);
    } else if (fieldName === 'name') {
      setName(value);
    }

    // Clear general error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const getPasswordStrengthText = () => {
    const { score } = passwordStrength;
    if (score === 0) return '';
    if (score === 1) return language === 'ml' ? 'ദുർബലം' : 'Weak';
    if (score === 2) return language === 'ml' ? 'മിതമായത്' : 'Fair';
    if (score === 3) return language === 'ml' ? 'നല്ലത്' : 'Good';
    return language === 'ml' ? 'ശക്തമായത്' : 'Strong';
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (score === 1) return 'bg-red-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-green-500';
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
          {t.name}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleInputChange}
            className={clsx(
              "pl-10 pr-10 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400",
              isNameValid === false
                ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400"
                : isNameValid === true
                  ? "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            )}
            placeholder={t.namePlaceholder}
            required
          />
          {isNameValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isNameValid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {validationErrors.name && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {validationErrors.name}
          </motion.p>
        )}
      </div>

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
              "pl-10 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400",
              validationErrors.password
                ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400"
                : passwordStrength.score >= 3
                  ? "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            )}
            placeholder={t.passwordPlaceholder}
            required
          />
        </div>
        
        {/* Password strength meter */}
        {password && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {language === 'ml' ? 'പാസ്‌വേഡ് ശക്തി' : 'Password strength'}:
                <span className={clsx(
                  "ml-1 font-semibold",
                  passwordStrength.score === 1 ? "text-red-500" :
                  passwordStrength.score === 2 ? "text-yellow-500" :
                  passwordStrength.score === 3 ? "text-blue-500" :
                  passwordStrength.score === 4 ? "text-green-500" : ""
                )}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {passwordStrength.score}/4
              </div>
            </div>
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                className={`h-full ${getPasswordStrengthColor()}`}
              />
            </div>
            
            {/* Password requirements - Hide detailed list on small screens */}
            <div className="mt-2 space-y-1 hidden sm:block">
              <div className="flex items-center text-xs">
                {passwordStrength.hasMinLength ? (
                  <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                )}
                <span className={passwordStrength.hasMinLength ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                  {language === 'ml' ? '8 അക്ഷരങ്ങളെങ്കിലും' : 'At least 8 characters'}
                </span>
              </div>
              <div className="flex items-center text-xs">
                {passwordStrength.hasUppercase ? (
                  <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                )}
                <span className={passwordStrength.hasUppercase ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                  {language === 'ml' ? 'ഒരു വലിയ അക്ഷരം' : 'One uppercase letter'}
                </span>
              </div>
              <div className="flex items-center text-xs">
                {passwordStrength.hasLowercase ? (
                  <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                )}
                <span className={passwordStrength.hasLowercase ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                  {language === 'ml' ? 'ഒരു ചെറിയ അക്ഷരം' : 'One lowercase letter'}
                </span>
              </div>
              <div className="flex items-center text-xs">
                {passwordStrength.hasNumber ? (
                  <Check className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                )}
                <span className={passwordStrength.hasNumber ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                  {language === 'ml' ? 'ഒരു അക്കം' : 'One number'}
                </span>
              </div>
            </div>
          </div>
        )}
        
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
        disabled={loading || !!validationErrors.name || !!validationErrors.email || !!validationErrors.password || passwordStrength.score < 3}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span>{t.signingUp}</span>
          </div>
        ) : (
          t.signup
        )}
      </Button>
    </motion.form>
  );
}