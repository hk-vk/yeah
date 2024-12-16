import { generateRandomAnalysis } from './analysis/analysis';

export function analyzeFakeNews(content: string): ReturnType<typeof generateRandomAnalysis> {
  // You could use the content parameter to influence the analysis
  // For now, we'll just return random results
  return generateRandomAnalysis();
}
