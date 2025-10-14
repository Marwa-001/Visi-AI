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
  
  // If text is empty or too short, return low score
  if (!cleanText || cleanText.length < 50) {
    return {
      score: 20,
      fleschScore: 0,
      gradeLevel: 'Insufficient Data',
      issues: ['Text content too short for analysis']
    };
  }
  
  // Count sentences (split by . ! ?)
  const sentenceMatches = cleanText.match(/[.!?]+/g);
  const sentenceCount = sentenceMatches ? sentenceMatches.length : 1;
  
  // Count words
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  console.log(`📊 Readability Analysis - Words: ${wordCount}, Sentences: ${sentenceCount}`);
  
  // If still too short
  if (wordCount < 20) {
    return {
      score: 30,
      fleschScore: 0,
      gradeLevel: 'Insufficient Data',
      issues: ['Not enough content to analyze']
    };
  }
  
  // Count syllables (simplified but improved)
  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    
    // Count vowel groups (more accurate)
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    
    // Adjust for silent e
    if (word.endsWith('e')) count--;
    
    // Adjust for le at end
    if (word.endsWith('le') && word.length > 2) count++;
    
    return Math.max(1, count);
  };
  
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Flesch Reading Ease Formula
  // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
  
  let fleschScore = 206.835 
    - 1.015 * avgWordsPerSentence 
    - 84.6 * avgSyllablesPerWord;
  
  // Clamp score between 0-100
  fleschScore = Math.max(0, Math.min(100, fleschScore));
  
  console.log(`📊 Flesch Score: ${fleschScore.toFixed(1)}`);
  console.log(`📊 Avg Words/Sentence: ${avgWordsPerSentence.toFixed(1)}`);
  console.log(`📊 Avg Syllables/Word: ${avgSyllablesPerWord.toFixed(1)}`);
  
  // Determine grade level
  let gradeLevel = '';
  if (fleschScore >= 90) gradeLevel = 'Grade 5 (Very Easy)';
  else if (fleschScore >= 80) gradeLevel = 'Grade 6 (Easy)';
  else if (fleschScore >= 70) gradeLevel = 'Grade 7 (Fairly Easy)';
  else if (fleschScore >= 60) gradeLevel = 'Grade 8-9 (Standard)';
  else if (fleschScore >= 50) gradeLevel = 'Grade 10-12 (Fairly Difficult)';
  else if (fleschScore >= 30) gradeLevel = 'College (Difficult)';
  else gradeLevel = 'College Graduate (Very Difficult)';
  
  // Generate issues based on analysis
  if (fleschScore < 30) {
    issues.push('Text is very difficult to read - consider simplifying');
  } else if (fleschScore < 50) {
    issues.push('Text is fairly difficult - consider using simpler words');
  }
  
  if (avgWordsPerSentence > 25) {
    issues.push(`Long sentences detected (avg ${avgWordsPerSentence.toFixed(1)} words/sentence) - break into shorter sentences`);
  }
  
  if (avgSyllablesPerWord > 1.7) {
    issues.push('Using many complex words - consider simplifying vocabulary');
  }

  // Check for passive voice (simplified detection)
  const passivePattern = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveCount = (cleanText.match(passivePattern) || []).length;
  if (passiveCount > wordCount * 0.1) {
    issues.push(`High passive voice usage (${passiveCount} instances) - prefer active voice`);
  }
  
  // Calculate final readability score (0-100)
  let score = fleschScore;
  
  // Bonus for good metrics
  if (avgWordsPerSentence <= 15) score += 5;
  if (avgSyllablesPerWord <= 1.5) score += 5;
  if (passiveCount <= wordCount * 0.05) score += 5;
  
  // Penalties for bad metrics
  if (avgWordsPerSentence > 30) score -= 10;
  if (avgSyllablesPerWord > 2) score -= 10;
  if (passiveCount > wordCount * 0.15) score -= 10;
  
  score = Math.max(0, Math.min(100, score));
  
  console.log(`✅ Final Readability Score: ${score.toFixed(1)}`);
  console.log(`✅ Issues Found: ${issues.length} - ${issues.join(', ')}`);
  
  return {
    score: Math.round(score),
    fleschScore: Math.round(fleschScore * 10) / 10,
    gradeLevel,
    issues
  };
};