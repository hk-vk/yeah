import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Image, Scissors, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';
import type { ImageAnalysisResult } from '../types/analysis';

interface ImageAnalysisSlidersProps {
  result: ImageAnalysisResult;
}

export const ImageAnalysisSliders: React.FC<ImageAnalysisSlidersProps> = ({ result }) => {
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';
  
  // Prepare analysis metrics
  const aiGeneratedScore = result.details.ai_generated ? 0.9 : 0.1;
  const deepfakeScore = result.details.deepfake ? 0.9 : 0.1;
  const tamperingScore = result.details.tampering_analysis ? 0.9 : 0.1;
  
  // Convert scores to percentages
  const aiGeneratedPercentage = Math.round(aiGeneratedScore * 100);
  const deepfakePercentage = Math.round(deepfakeScore * 100);
  const tamperingPercentage = Math.round(tamperingScore * 100);
  const trustScore = Math.round(result.score * 100);

  // Function to get appropriate color based on score
  const getColorForScore = (score: number, isInverted = false) => {
    if (isInverted) {
      return score >= 70 ? "bg-red-500" : score >= 40 ? "bg-yellow-500" : "bg-green-500";
    }
    return score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  };

  // Labels based on language
  const labels = {
    aiGenerated: isMalayalam ? 'AI നിർമ്മിതം' : 'AI Generated',
    deepfake: isMalayalam ? 'ഡീപ്ഫേക്ക്' : 'Deepfake',
    tampering: isMalayalam ? 'കൃത്രിമം' : 'Manipulation',
    trustScore: isMalayalam ? 'Trust Score' : 'Trust Score',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 space-y-4"
    >
      <h3 className={clsx(
        "text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100",
        isMalayalam && "text-xl"
      )}>
        {isMalayalam ? 'ചിത്ര വിശകലനം' : 'Image Analysis Metrics'}
      </h3>
      
      {/* AI Generated Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Cpu className="w-4 h-4 mr-2" />
            <span className={clsx(isMalayalam && "text-base")}>{labels.aiGenerated}</span>
          </div>
          <span className={clsx(
            "text-sm font-medium",
            aiGeneratedPercentage >= 70 ? "text-red-500" : 
            aiGeneratedPercentage >= 40 ? "text-yellow-500" : "text-green-500"
          )}>
            {aiGeneratedPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={clsx(
              "h-2.5 rounded-full",
              getColorForScore(aiGeneratedPercentage, true)
            )}
            style={{ width: `${aiGeneratedPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Deepfake Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className={clsx(isMalayalam && "text-base")}>{labels.deepfake}</span>
          </div>
          <span className={clsx(
            "text-sm font-medium",
            deepfakePercentage >= 70 ? "text-red-500" : 
            deepfakePercentage >= 40 ? "text-yellow-500" : "text-green-500"
          )}>
            {deepfakePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={clsx(
              "h-2.5 rounded-full",
              getColorForScore(deepfakePercentage, true)
            )}
            style={{ width: `${deepfakePercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Tampering Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Scissors className="w-4 h-4 mr-2" />
            <span className={clsx(isMalayalam && "text-base")}>{labels.tampering}</span>
          </div>
          <span className={clsx(
            "text-sm font-medium",
            tamperingPercentage >= 70 ? "text-red-500" : 
            tamperingPercentage >= 40 ? "text-yellow-500" : "text-green-500"
          )}>
            {tamperingPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={clsx(
              "h-2.5 rounded-full",
              getColorForScore(tamperingPercentage, true)
            )}
            style={{ width: `${tamperingPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Trust Score Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Image className="w-4 h-4 mr-2" />
            <span className={clsx(isMalayalam && "text-base")}>{labels.trustScore}</span>
          </div>
          <span className={clsx(
            "text-sm font-medium",
            trustScore >= 70 ? "text-green-500" : 
            trustScore >= 40 ? "text-yellow-500" : "text-red-500"
          )}>
            {trustScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={clsx(
              "h-2.5 rounded-full",
              getColorForScore(trustScore)
            )}
            style={{ width: `${trustScore}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
}; 