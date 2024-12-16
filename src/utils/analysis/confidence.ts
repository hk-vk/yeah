export function generateRandomConfidence(): number {
  // Generate a random confidence score between 60 and 98
  return Math.floor(Math.random() * 38) + 60;
}

export function determineReliability(confidence: number): boolean {
  // Consider news reliable if confidence is above 80%
  return confidence > 80;
}
