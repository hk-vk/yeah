import React, { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Check if we're on the admin page
  const isAdminPage = location.pathname === '/admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 20 - 10;
    const y = ((e.clientY - rect.top) / rect.height) * 20 - 10;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const navItems = [
    { path: '/', label: t.home },
    { path: '/analyze', label: t.analyze },
    { path: '/trending', label: t.trending },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <BackgroundAnimation />
      {!isAdminPage && (
        <nav
          className={`fixed w-full top-0 transition-all duration-300 ease-in-out z-50
            ${isScrolled ? 'py-2' : 'py-4'}
            ${
              isScrolled 
                ? 'bg-white/85 dark:bg-gray-800/70' 
                : 'bg-white/75 dark:bg-gray-800/50'
            }
            backdrop-blur-lg
            border-b border-gray-200/80 dark:border-gray-700/30
            shadow-[0_8px_32px_-15px_rgba(0,0,0,0.15)]
            after:absolute after:inset-0 after:z-[-1]
            after:bg-gradient-to-b after:from-white/60 after:to-white/30 dark:after:from-gray-800/40 dark:after:to-gray-900/20
          `}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="flex items-center justify-between h-16"
              style={{ transform: 'translateZ(20px)' }}
            >
              <div className="flex items-center">
                <Link to="/" className="flex items-center group hover:scale-105 transition-transform duration-200">
                  <Newspaper className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
                  <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
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
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-blue-50/80 dark:text-gray-200 dark:hover:bg-gray-700/50'
                        } px-4 py-2 rounded-xl text-sm font-medium
                        transition-all duration-300 ease-in-out
                        border border-gray-200/50 dark:border-gray-700/30
                        hover:border-blue-200 dark:hover:border-gray-600
                        hover:transform hover:translate-y-[-2px] hover:shadow-lg
                        active:transform active:translate-y-[1px]
                        relative overflow-hidden`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div 
                className="flex items-center space-x-4"
                style={{ transform: 'translateZ(20px)' }}
              >
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-xl text-gray-700 dark:text-gray-200
                  bg-white/50 dark:bg-gray-700/50
                  hover:bg-blue-50 dark:hover:bg-gray-600/50
                  transition-all duration-300 ease-in-out
                  hover:transform hover:scale-105 hover:shadow-md
                  border border-gray-200/50 dark:border-gray-700/30
                  hover:border-blue-200 dark:hover:border-gray-600"
                >
                  <Languages className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-gray-700 dark:text-gray-200
                  bg-white/50 dark:bg-gray-700/50
                  hover:bg-blue-50 dark:hover:bg-gray-600/50
                  transition-all duration-300 ease-in-out
                  hover:transform hover:scale-105 hover:shadow-md
                  border border-gray-200/50 dark:border-gray-700/30
                  hover:border-blue-200 dark:hover:border-gray-600"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
                <div className="transform transition-all duration-300 hover:scale-105">
                  {user ? <UserMenu /> : <AuthButtons />}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 ${!isAdminPage ? 'mt-24' : 'mt-0'}`}>
        {children}
      </main>
    </div>
  );
}