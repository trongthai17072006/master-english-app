/**
 * Robust Fisher-Yates array shuffling and question/options randomizers.
 * Ensures that questions and option positions continuously randomize on open
 * without predictable repeats or static order.
 */

export function shuffleArray<T>(array: readonly T[] | T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Shuffles an item's options array while accurately updating its correctOptionIndex.
 */
export function shuffleOptionsWithIndex<T extends { options: string[]; correctOptionIndex: number }>(item: T): T {
  const correctOptionText = item.options[item.correctOptionIndex];
  const shuffledOptions = shuffleArray(item.options);
  const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

  return {
    ...item,
    options: shuffledOptions,
    correctOptionIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0
  };
}

/**
 * Shuffles options for a question where correctAnswer is a string.
 */
export function shuffleOptionsWithStringAnswer<T extends { options: string[]; correctAnswer: string }>(item: T): T {
  return {
    ...item,
    options: shuffleArray(item.options)
  };
}
