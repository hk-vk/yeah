import React, { useRef, useEffect, useState, memo } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

// Optimized Counter component using useSpring and useInView
const Counter = memo(({ value, duration = 1.5 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const valueNum = parseInt(value.replace(/[^0-9]/g, ''));
  const springValue = useSpring(0, { 
    stiffness: 100,
    damping: 30,
    restDelta: 0.01
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(valueNum);
    }
  }, [isInView, springValue, valueNum]);

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    return springValue.onChange((latest) => {
      setDisplayValue(String(Math.round(latest)));
    });
  }, [springValue]);

  return <span ref={ref}>{value.replace(/[0-9]+/, displayValue)}</span>;
});

export const Stats = memo(function Stats() {
  const { language } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const stats = [
    {
      value: '65%',
      label: language === 'ml' ? 'വ്യാജ വാർത്തകൾ' : 'Fake News',
      description: language === 'ml' 
        ? 'ലോകത്തിലെ വാർത്തകളിൽ' 
        : 'of news worldwide'
    },
    {
      value: '96%',
      label: language === 'ml' ? 'കൃത്യത' : 'Accuracy',
      description: language === 'ml'
        ? 'തിരിച്ചറിയൽ നിരക്ക്'
        : 'detection rate'
    },
    {
      value: '50 L',
      label: language === 'ml' ? 'ജനങ്ങൾ' : 'People',
      description: language === 'ml'
        ? 'കേരളത്തിൽ വ്യാജ വാർത്തകളാൽ സ്വാധീനിക്കപ്പെടുന്നു '
        : 'affected by fake news in Kerala'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.section 
      ref={ref}
      className="py-12 sm:py-16 px-4"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              y: -5, 
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
              transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
            className="text-center p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-md shadow-lg 
                       group transition-all duration-300 transform-gpu will-change-transform"
            style={{ willChange: 'transform, box-shadow' }}
          >
            <div className="text-3xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2 sm:mb-3">
              <Counter value={stat.value} />
            </div>

            <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {stat.label}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              {stat.description}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
});