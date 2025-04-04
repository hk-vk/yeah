import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { FeatureCard } from '../components/home/FeatureCard';

// Lazy load components that are potentially below the fold
const QuoteSlider = lazy(() => 
  import('../components/home/QuoteSlider')
  .then(module => ({ default: module.QuoteSlider }))
);
const Stats = lazy(() => 
  import('../components/Stats')
  .then(module => ({ default: module.Stats }))
);

// Simple Spinner for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];

  const features = [
    {
      icon: Shield,
      title: t.featureTitle1,
      description: t.featureDesc1
    },
    {
      icon: Brain,
      title: t.featureTitle2,
      description: t.featureDesc2
    },
    {
      icon: Zap,
      title: t.featureTitle3,
      description: t.featureDesc3
    }
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 overflow-x-hidden px-4 sm:px-0">
      <motion.section 
        className="text-center pt-8 sm:pt-12"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <motion.div
          className="max-w-3xl mx-auto"
        >
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            variants={{ hidden: { scale: 0.9, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } } }}
          >
            {t.heroTitle}
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.1 } } }}
          >
            {t.heroSubtitle}
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300 } }}
            whileTap={{ scale: 0.95 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
          >
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform-gpu will-change-transform"
              style={{ willChange: 'transform, box-shadow' }}
            >
              {t.getStarted}
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 rounded-xl bg-gradient-radial from-blue-500/5 via-transparent to-transparent"
        />
        <Suspense fallback={<LoadingSpinner />}>
          <QuoteSlider />
        </Suspense>
      </motion.section>

      <Suspense fallback={<LoadingSpinner />}>
        <Stats />
      </Suspense>

      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </motion.section>

      <motion.section 
        className="text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          whileHover={{ 
            y: -5,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            transition: { type: "spring", stiffness: 300 }
          }}
          className="p-6 sm:p-10 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-md shadow-lg max-w-4xl mx-auto transform-gpu will-change-transform"
          style={{ willChange: 'transform, box-shadow' }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } }}
          >
            {t.ctaTitle}
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.1 } } }}
          >
            {t.ctaDescription}
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300 } }}
            whileTap={{ scale: 0.95 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
          >
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-3 border-2 border-blue-600 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 transform-gpu will-change-transform"
              style={{ willChange: 'transform, background-color, color, box-shadow' }}
            >
              {t.startAnalyzing}
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}