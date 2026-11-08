import React from 'react';
import { ChallengeVocabWord } from '../data/challenge60Data';
import { speakWord } from './soundAndSpeech';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights occurrences of any target vocabulary words from the day's 15-word list
 * inside an English text (Reading passage, Listening transcript, Writing model essay,
 * or Speaking model answer). Clicking any highlighted word speaks it aloud and shows
 * its IPA + Vietnamese meaning on hover.
 */
export function renderTextWithHighlightedVocab(
  text: string,
  vocabList: ChallengeVocabWord[],
  variant: 'crimson' | 'emerald' | 'amber' = 'crimson'
): React.ReactNode {
  if (!text || !Array.isArray(vocabList) || vocabList.length === 0) {
    return text;
  }

  const validWords = vocabList
    .filter(v => v && typeof v.word === 'string' && v.word.trim().length >= 3)
    .sort((a, b) => b.word.length - a.word.length);

  if (validWords.length === 0) return text;

  const wordMap = new Map<string, ChallengeVocabWord>();
  const patterns: string[] = [];

  for (const vw of validWords) {
    const clean = vw.word.trim().toLowerCase();
    wordMap.set(clean, vw);
    // Match exact word or common inflections (-s, -es, -ed, -d, -ing, -ly)
    const stem = clean.length >= 5 && clean.endsWith('e') ? clean.slice(0, -1) : clean;
    patterns.push(`\\b(?:${escapeRegex(clean)}|${escapeRegex(stem)}(?:s|es|ed|d|ing|ly)?)\\b`);
  }

  const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
  const parts = text.split(regex);

  const badgeStyles = {
    crimson:
      'bg-[#FFF1F0] text-[#B83226] border-[#F8B4B4] hover:bg-[#B83226] hover:text-white',
    emerald:
      'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-700 hover:text-white',
    amber:
      'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-700 hover:text-white'
  }[variant];

  return parts.map((part, idx) => {
    if (!part) return null;
    const lower = part.toLowerCase();
    let matchedWordObj: ChallengeVocabWord | undefined = wordMap.get(lower);

    if (!matchedWordObj) {
      for (const vw of validWords) {
        const clean = vw.word.trim().toLowerCase();
        const stem = clean.length >= 5 && clean.endsWith('e') ? clean.slice(0, -1) : clean;
        if (lower === clean || (lower.startsWith(stem) && lower.length <= clean.length + 4)) {
          matchedWordObj = vw;
          break;
        }
      }
    }

    if (!matchedWordObj) {
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    }

    return (
      <button
        key={idx}
        type="button"
        onClick={e => {
          e.stopPropagation();
          speakWord(matchedWordObj!.word);
        }}
        title={`${matchedWordObj.word} ${matchedWordObj.ipa} (${matchedWordObj.pos}): ${matchedWordObj.meaning}`}
        className={`inline-flex items-baseline gap-0.5 px-1.5 py-0.2 mx-0.5 rounded-md border font-bold transition-colors cursor-pointer ${badgeStyles}`}
      >
        <span>{part}</span>
      </button>
    );
  });
}
