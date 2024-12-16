import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Newspaper, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { BackgroundAnimation } from './BackgroundAnimation';
import { AuthButtons } from './auth/AuthButtons';
import { UserMenu } from './auth/UserMenu';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const t = translations[language];

  const navItems = [
    { path: '/', label: t.home },
    { path: '/analyze', label: t.analyze },
    { path: '/trending', label: t.trending },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <BackgroundAnimation />
      <nav className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 backdrop-blur-lg z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Newspaper className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  {t.title}
                </span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  {navItems.map(({ path, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`${
                        location.pathname === path
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Languages className="h-5 w-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              {user ? <UserMenu /> : <AuthButtons />}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
