import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import AdminPage from './pages/AdminPage';
import { TrendingPage } from './pages/TrendingPage';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { LanguageToggle } from './components/LanguageToggle';
import { ThemeToggle } from './components/common/ThemeToggle';
import { MainContent } from './components/MainContent';
import { Login } from './components/Login';

export default function App() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">YEAH</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageToggle />
                <ThemeToggle />
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {language === 'ml' ? 'ലോഗിൻ' : 'Login'}
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
