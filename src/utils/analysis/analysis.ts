import { AnalysisResult } from '../../types';
import { generateRandomIndicators } from './indicators';
import { generateRandomConfidence, determineReliability } from './confidence';

export function generateRandomAnalysis(): AnalysisResult {
  const confidence = generateRandomConfidence();
  const isReliable = determineReliability(confidence);
  const indicators = generateRandomIndicators();

  return {
    isReliable,
    confidence,
    analysis: isReliable
      ? "Based on our comprehensive analysis, this content demonstrates strong credibility markers and adheres to journalistic standards."
      : "Our analysis has identified several potential credibility concerns that warrant careful consideration.",
    indicators
  };
}
