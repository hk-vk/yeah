import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import AdminPage from './pages/AdminPage';
import { TrendingPage } from './pages/TrendingPage';

export default function App() {
  return (
    <>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }} >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/analyze" element={<AnalyzePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/trending" element={<TrendingPage />} />
                </Routes>
              </Layout>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
}
