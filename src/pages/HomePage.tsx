import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { FeatureCard } from '../components/home/FeatureCard';
import StarBorder from '../components/home/StarBorder/StarBorder';

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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="space-y-16 sm:space-y-20">
      <motion.section 
        className="text-center pt-8 sm:pt-12 px-4"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <motion.div className="max-w-3xl mx-auto">
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            variants={itemVariants}
          >
            {t.heroTitle}
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10"
            variants={itemVariants}
          >
            {t.heroSubtitle}
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="transform-gpu"
            style={{ willChange: 'transform' }}
          >
            <Link
              to="/analyze"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
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
        viewport={{ once: true, amount: 0.1 }}
        className="relative px-4"
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-blue-50/50 dark:from-gray-800/20 to-transparent -z-10"/>
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
        viewport={{ once: true, amount: 0.1 }}
        className="px-4"
      >
        <motion.div 
          className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </motion.div>
      </motion.section>

      <motion.section 
        className="text-center px-4"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 sm:p-10 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-md shadow-lg max-w-4xl mx-auto transform-gpu"
          style={{ willChange: 'transform, box-shadow' }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white"
            variants={itemVariants}
          >
            {t.ctaTitle}
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {t.ctaDescription}
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="transform-gpu"
            style={{ willChange: 'transform' }}
          >
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-3 border-2 border-blue-600 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              {t.startAnalyzing}
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}