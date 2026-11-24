// Arabic text normalization & fuzzy matching utility for answer verification

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Remove diacritics (Tashkeel)
    .replace(/[\u064b-\u0652]/g, '')
    // Normalize Alef variants (أ إ آ أ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marboota (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Yaa variants (ى -> ي)
    .replace(/ى/g, 'ي')
    // Remove definite article "ال" prefix if present at the start of words for loose comparison
    .replace(/\bال/g, '')
    // Remove extra whitespace, punctuation, and non-alphanumeric Arabic characters
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function checkAnswerMatch(userGuess: string, targetAnswer: string, synonyms?: string[]): boolean {
  const normGuess = normalizeArabic(userGuess);
  const normTarget = normalizeArabic(targetAnswer);

  if (!normGuess) return false;

  // Direct match after normalization
  if (normGuess === normTarget) return true;

  // Check without removing 'ال' as well
  const rawNormGuess = userGuess.trim().toLowerCase().replace(/[\u064b-\u0652]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const rawNormTarget = targetAnswer.trim().toLowerCase().replace(/[\u064b-\u0652]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  if (rawNormGuess === rawNormTarget) return true;

  // Check synonyms if provided
  if (synonyms && synonyms.length > 0) {
    for (const syn of synonyms) {
      if (normalizeArabic(syn) === normGuess || syn.trim().toLowerCase() === userGuess.trim().toLowerCase()) {
        return true;
      }
    }
  }

  // Check substring containment if target is multi-word or guess is substantial
  if (normGuess.length >= 3 && normTarget.includes(normGuess)) {
    // If guess is at least 70% of target or exact word match
    const targetWords = normTarget.split(' ');
    const guessWords = normGuess.split(' ');
    if (targetWords.some(w => guessWords.includes(w) && w.length >= 3)) {
      return true;
    }
  }

  return false;
}
