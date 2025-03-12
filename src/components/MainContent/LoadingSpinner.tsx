import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export function LoadingSpinner() {
  const { language } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[300px] w-full"
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: {
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-lg text-gray-600 dark:text-gray-300 font-medium"
      >
        {language === 'ml' ? 'വിശകലനം ചെയ്യുന്നു...' : 'Analyzing...'}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-2 text-sm text-gray-500 dark:text-gray-400"
      >
        {language === 'ml' 
          ? 'ഇത കുറച്ച് സമയമെടുക്കും, ദയവായി കാത്തിരിക്കുക' 
          : 'This may take a moment, please wait'}
      </motion.p>
    </motion.div>
  );
}
