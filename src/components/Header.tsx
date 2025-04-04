import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Newspaper, Menu, X } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export function Header() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", text: t.home },
    { to: "/analyze", text: t.analyze },
    { to: "/trending", text: t.trending },
  ];

  const activeLinkClass = "text-blue-600 dark:text-blue-400 font-semibold";
  const inactiveLinkClass = "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white";

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Newspaper className="h-8 w-8 text-blue-600 mr-2 flex-shrink-0" />
              <Logo />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => 
                  clsx(isActive ? activeLinkClass : inactiveLinkClass, "transition-colors duration-200")
                }
              >
                {link.text}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                  <button 
                    onClick={logout}
                    className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-sm px-3 py-1 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t.login}
                  </Link>
                  <Link 
                    to="/signup" 
                    className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {t.signup}
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center">
              {!user && (
                 <Link 
                    to="/login"
                    className="text-sm px-3 py-1 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
                  >
                    {t.login} 
                  </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <nav className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    clsx(isActive ? activeLinkClass : inactiveLinkClass, "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200")
                  }
                >
                  {link.text}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300">{user.email}</div>
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {t.login}
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      {t.signup}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
