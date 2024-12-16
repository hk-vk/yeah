import { IndicatorResult } from '../../types';

const INDICATOR_IDS = ['sensationalism', 'writingStyle', 'clickbait', 'sourceCredibility'];

export function generateRandomScore(): number {
  return Math.floor(Math.random() * 100);
}

export function generateRandomIndicators(): IndicatorResult[] {
  return INDICATOR_IDS.map(id => ({
    id,
    score: generateRandomScore()
  }));
}
