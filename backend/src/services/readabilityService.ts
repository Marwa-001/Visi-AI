

export interface ReadabilityResult {
  score: number;
  fleschScore: number;
  gradeLevel: string;
  issues: string[];
}

export const analyzeReadability = (text: string): ReadabilityResult => {
  const issues: string[] = [];
  
  // Clean text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count sentences
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Count words
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Count syllables (simplified)
  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    if (word.endsWith('e')) count--;
    return Math.max(1, count);
  };
  
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Flesch Reading Ease Score
  // Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
  
  const fleschScore = Math.max(0, Math.min(100, 
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  ));
  
  // Determine grade level
  let gradeLevel = '';
  if (fleschScore >= 90) gradeLevel = 'Grade 5';
  else if (fleschScore >= 80) gradeLevel = 'Grade 6';
  else if (fleschScore >= 70) gradeLevel = 'Grade 7';
  else if (fleschScore >= 60) gradeLevel = 'Grade 8-9';
  else if (fleschScore >= 50) gradeLevel = 'Grade 10-12';
  else if (fleschScore >= 30) gradeLevel = 'College';
  else gradeLevel = 'College Graduate';
  
  // Generate issues
  if (avgWordsPerSentence > 25) {
    issues.push(`Long sentences detected (avg ${avgWordsPerSentence.toFixed(1)} words/sentence)`);
  }
  
  if (fleschScore < 60) {
    issues.push('Text is difficult to read for general audience');
  }
  
  if (avgSyllablesPerWord > 1.7) {
    issues.push('Complex words used - consider simplifying');
  }

  // Check for passive voice (simplified detection)
  const passiveCount = cleanText.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi)?.length || 0;
  if (passiveCount > wordCount * 0.1) {
    issues.push('High use of passive voice - consider active voice');
  }
  
  // Calculate final score (0-100)
  let score = fleschScore;
  if (avgWordsPerSentence > 30) score -= 10;
  if (avgSyllablesPerWord > 2) score -= 10;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    fleschScore,
    gradeLevel,
    issues
  };
};