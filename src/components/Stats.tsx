import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export function Stats() {
  const { language } = useLanguage();
  const { scrollYProgress } = useScroll();

  // Create counter animation effect
  const Counter = ({ value, duration = 2 }) => {
    const [count, setCount] = React.useState(0);
    const valueNum = parseInt(value.replace(/[^0-9]/g, ''));
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        if (count < valueNum) {
          setCount(prev => Math.min(prev + Math.ceil(valueNum / (duration * 20)), valueNum));
        }
      }, 50);
      return () => clearInterval(interval);
    }, [count, valueNum]);

    return value.replace(/[0-9]+/, count);
  };

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

  // Scale animation based on scroll
  const scale = useTransform(scrollYProgress, [0.3, 0.4], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0.3, 0.4], [0.3, 1]);

  return (
    <motion.section 
      className="py-12 relative"
      style={{ scale, opacity }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
              className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Counter value={stat.value} />
            </motion.div>

            <motion.div
              className="text-lg font-semibold text-gray-900 dark:text-white mb-1"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
            >
              {stat.label}
            </motion.div>

            <motion.div
              className="text-sm text-gray-600 dark:text-gray-300"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
            >
              {stat.description}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}