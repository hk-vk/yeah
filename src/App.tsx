import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const TrendingPage = lazy(() => import('./pages/TrendingPage').then(module => ({ default: module.TrendingPage })));

// Basic loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="text-xl">Loading...</div>
  </div>
);

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
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/analyze" element={<AnalyzePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/trending" element={<TrendingPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
}
