// Session memory and question pool manager for MASTER English
// Ensures quiz questions and practice items do not repeat across rounds until the pool is exhausted.

const SEEN_SPEED_KEY = 'leximaster_seen_speed_v1';
const SEEN_COLLOC_KEY = 'leximaster_seen_colloc_v1';
const SEEN_CONTEXT_KEY = 'leximaster_seen_context_v1';
const SEEN_FLASHCARD_KEY = 'leximaster_seen_flashcard_v1';

export function getSeenIds(poolKey: string): string[] {
  try {
    const raw = localStorage.getItem(poolKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markIdsSeen(poolKey: string, ids: string[]): void {
  try {
    const current = new Set(getSeenIds(poolKey));
    ids.forEach(id => current.add(id));
    localStorage.setItem(poolKey, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.error('Failed to mark seen ids', e);
  }
}

export function resetSeenIds(poolKey: string): void {
  try {
    localStorage.removeItem(poolKey);
  } catch (e) {
    console.error('Failed to reset pool', e);
  }
}

/**
 * Filter items to prioritize unseen items first.
 * If unseen items are fewer than count, recycle seen items and auto-reset.
 */
export function getSmartBatch<T extends { id: string }>(
  allItems: T[],
  poolKey: string,
  batchSize: number = 10
): { items: T[]; wasRecycled: boolean; totalSeen: number } {
  if (allItems.length <= batchSize) {
    return { items: allItems, wasRecycled: false, totalSeen: allItems.length };
  }

  const seenIds = new Set(getSeenIds(poolKey));
  const unseen = allItems.filter(item => !seenIds.has(item.id));

  let selected: T[] = [];
  let wasRecycled = false;

  if (unseen.length >= batchSize) {
    // We have plenty of unseen items
    selected = unseen.slice(0, batchSize);
  } else {
    // Unseen pool is exhausted or almost empty -> take remaining unseen + wrap around
    wasRecycled = true;
    selected = [...unseen];
    const needed = batchSize - selected.length;
    // Reset pool in localStorage so new cycle begins
    resetSeenIds(poolKey);
    const seenAgain = allItems.filter(item => !selected.some(s => s.id === item.id));
    selected = selected.concat(seenAgain.slice(0, needed));
  }

  // Record newly selected in seen pool
  markIdsSeen(poolKey, selected.map(s => s.id));

  return {
    items: selected,
    wasRecycled,
    totalSeen: Math.min(seenIds.size + selected.length, allItems.length)
  };
}

export const POOL_KEYS = {
  SPEED: SEEN_SPEED_KEY,
  COLLOC: SEEN_COLLOC_KEY,
  CONTEXT: SEEN_CONTEXT_KEY,
  FLASHCARD: SEEN_FLASHCARD_KEY
};
