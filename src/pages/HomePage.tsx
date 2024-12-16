import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { Stats } from '../components/Stats';
import { QuoteSlider } from '../components/home/QuoteSlider';

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

  return (
    <div className="space-y-16">
      <motion.section 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {t.heroTitle}
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.heroSubtitle}
          </motion.p>
          <motion.div
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
            >
              {t.getStarted}
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Quote section with default loading animation */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.3,
          ease: "easeOut"
        }}
        className="relative"
      >
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
              "radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
              "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 rounded-xl"
        />
        <QuoteSlider />
      </motion.section>

      <Stats />

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
              className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm 
                         relative overflow-hidden group transition-all duration-300"
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="mb-6"
              >
                <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </motion.div>

              <motion.h3 
                className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
              >
                {feature.title}
              </motion.h3>

              <motion.p 
                className="text-sm text-gray-600 dark:text-gray-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
              >
                {feature.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className="p-8 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm"
        >
          <motion.h2 
            className="text-3xl font-bold mb-4 text-gray-900 dark:text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {t.ctaTitle}
          </motion.h2>
          <motion.p 
            className="text-lg mb-6 text-gray-600 dark:text-gray-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t.ctaDescription}
          </motion.p>
          <motion.div
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 border-2 border-blue-600 rounded-md text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              {t.startAnalyzing}
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}