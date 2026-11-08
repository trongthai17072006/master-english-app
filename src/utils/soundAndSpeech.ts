/**
 * MASTER ENGLISH — Unified Audio Synthesis & Global ElevenLabs TTS Service
 * Central Voice ID: NaMUH1vcebhHvD4z3Lku
 *
 * Architecture:
 * - Single Global TTS Service used by 100% of audio pronunciation buttons across the platform
 *   (Flashcards, Vocab Directory, Single Words, Examples & Sentences, Collocations,
 *    English Structures, Tricky Distinctions, Interactive Node Matching, Speaking, Reading,
 *    Listening, Writing, Speed Quiz, Context Quiz, Mistake Bank).
 * - Central Voice ID configured once in GLOBAL_TTS_CONFIG.voiceId ('NaMUH1vcebhHvD4z3Lku').
 * - Calls the backend proxy endpoint (/api/tts) so ELEVENLABS_API_KEY remains strictly in
 *   Backend Environment Variables / Secrets and is never exposed in frontend code.
 * - Includes in-memory Blob URL caching, in-flight request deduplication, Play / Pause / Replay,
 *   adjustable playback speed, rapid-click AbortController cleanup, and network error handling.
 */

import {
  extractPureEnglish,
  playJackPlugClick,
  playPageTurnFlip
} from './soundManager';

export const GLOBAL_TTS_CONFIG = {
  provider: 'elevenlabs' as const,
  voiceId: 'NaMUH1vcebhHvD4z3Lku',
  modelId: 'eleven_multilingual_v2',
  proxyEndpoint: '/api/tts',
  statusEndpoint: '/api/tts/status',
  defaultPlaybackRate: 1.0,
} as const;

export interface SpeakOptions {
  rate?: number;
  forceReplay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

export interface GlobalTtsState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  playbackRate: number;
  voiceId: string;
  lastError: string | null;
}

class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playCorrect() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  playWrong() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(220.0, now + 0.18); // A3

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio context might be restricted
    }
  }

  playStreak() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch {
      // Audio context might be restricted
    }
  }

  playTick() {
    playJackPlugClick();
  }

  playClick() {
    playJackPlugClick();
  }

  playFlip() {
    playPageTurnFlip();
  }
}

export const sounds = new SoundEffects();

// ============================================================================
// SINGLE GLOBAL ELEVENLABS TTS SERVICE (VOICE ID: NaMUH1vcebhHvD4z3Lku)
// ============================================================================
class GlobalElevenLabsTtsService {
  private audioCache = new Map<string, string>();
  private inFlightRequests = new Map<string, Promise<string>>();
  private activeAudio: HTMLAudioElement | null = null;
  private activeAbortController: AbortController | null = null;
  private listeners = new Set<(state: GlobalTtsState) => void>();

  private state: GlobalTtsState = {
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    currentText: '',
    playbackRate: GLOBAL_TTS_CONFIG.defaultPlaybackRate,
    voiceId: GLOBAL_TTS_CONFIG.voiceId,
    lastError: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedRate = window.localStorage.getItem('master_english_tts_rate');
        if (savedRate) {
          const parsed = parseFloat(savedRate);
          if (!Number.isNaN(parsed) && parsed >= 0.5 && parsed <= 2.0) {
            this.state.playbackRate = parsed;
          }
        }
      } catch {
        // Ignore localStorage read errors
      }
    }
  }

  private updateState(partial: Partial<GlobalTtsState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  getState(): GlobalTtsState {
    return this.state;
  }

  subscribe(listener: (state: GlobalTtsState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setPlaybackRate(rate: number) {
    const clamped = Math.min(2.0, Math.max(0.5, rate));
    this.updateState({ playbackRate: clamped });
    if (this.activeAudio) {
      this.activeAudio.playbackRate = clamped;
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('master_english_tts_rate', String(clamped));
      } catch {
        // Ignore storage write errors
      }
    }
  }

  getPlaybackRate(): number {
    return this.state.playbackRate;
  }

  stop() {
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch {}
      this.activeAbortController = null;
    }

    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
      this.activeAudio = null;
    }

    this.updateState({
      isLoading: false,
      isPlaying: false,
      isPaused: false,
    });
  }

  pause() {
    if (this.activeAudio && !this.activeAudio.paused) {
      try {
        this.activeAudio.pause();
        this.updateState({ isPlaying: false, isPaused: true });
      } catch {}
    }
  }

  resume() {
    if (this.activeAudio && this.activeAudio.paused && this.state.isPaused) {
      void this.activeAudio
        .play()
        .then(() => {
          this.updateState({ isPlaying: true, isPaused: false });
        })
        .catch((err) => {
          this.updateState({
            isPlaying: false,
            isPaused: false,
            lastError: err instanceof Error ? err.message : 'Playback resume failed',
          });
        });
    }
  }

  replay(options?: SpeakOptions) {
    if (this.state.currentText) {
      void this.speak(this.state.currentText, 'en-US', {
        ...options,
        forceReplay: true,
      });
    }
  }

  private normalizeText(rawText: string): string {
    return extractPureEnglish(rawText);
  }

  private getCacheKey(cleanText: string): string {
    return `${GLOBAL_TTS_CONFIG.voiceId}:${cleanText.toLowerCase()}`;
  }

  private async playBlobUrl(blobUrl: string, cleanText: string, options?: SpeakOptions) {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
      this.activeAudio = null;
    }

    const audio = new Audio(blobUrl);
    const targetRate = options?.rate ?? this.state.playbackRate;
    audio.playbackRate = targetRate;
    this.activeAudio = audio;

    audio.onplay = () => {
      this.updateState({
        isLoading: false,
        isPlaying: true,
        isPaused: false,
        currentText: cleanText,
        lastError: null,
      });
      options?.onStart?.();
    };

    audio.onended = () => {
      if (this.activeAudio === audio) {
        this.activeAudio = null;
      }
      this.updateState({
        isLoading: false,
        isPlaying: false,
        isPaused: false,
      });
      options?.onEnd?.();
    };

    audio.onerror = () => {
      if (this.activeAudio === audio) {
        this.activeAudio = null;
      }
      const errMsg = 'Không thể phát luồng âm thanh ElevenLabs.';
      this.updateState({
        isLoading: false,
        isPlaying: false,
        isPaused: false,
        lastError: errMsg,
      });
      options?.onError?.(errMsg);
    };

    await audio.play();
  }

  async speak(text: string, _lang = 'en-US', options?: SpeakOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    const cleanText = this.normalizeText(text);
    if (!cleanText) return;

    // If the same text is currently paused and forceReplay is not set, resume it
    if (
      !options?.forceReplay &&
      this.activeAudio &&
      this.state.isPaused &&
      this.state.currentText.toLowerCase() === cleanText.toLowerCase()
    ) {
      this.resume();
      return;
    }

    // Stop any previous audio or pending request before starting the new one
    this.stop();

    const cacheKey = this.getCacheKey(cleanText);

    // 1. Play immediately from in-memory Blob URL cache if already synthesized
    const cachedBlobUrl = this.audioCache.get(cacheKey);
    if (cachedBlobUrl) {
      try {
        await this.playBlobUrl(cachedBlobUrl, cleanText, options);
        return;
      } catch {
        // Revoke broken blob URL and re-fetch
        URL.revokeObjectURL(cachedBlobUrl);
        this.audioCache.delete(cacheKey);
      }
    }

    // 2. Check offline status before calling API
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const offlineMsg = 'Mất kết nối mạng: Không thể tải giọng đọc ElevenLabs.';
      console.warn(`[GlobalElevenLabsTTS] ${offlineMsg}`);
      this.updateState({
        isLoading: false,
        isPlaying: false,
        isPaused: false,
        currentText: cleanText,
        lastError: offlineMsg,
      });
      options?.onError?.(offlineMsg);
      return;
    }

    this.updateState({
      isLoading: true,
      isPlaying: false,
      isPaused: false,
      currentText: cleanText,
      lastError: null,
    });

    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      let fetchPromise = this.inFlightRequests.get(cacheKey);

      if (!fetchPromise) {
        fetchPromise = (async () => {
          const response = await fetch(GLOBAL_TTS_CONFIG.proxyEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
            },
            body: JSON.stringify({
              text: cleanText,
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            let errDetail = `HTTP ${response.status}`;
            try {
              const errJson = await response.json();
              errDetail = errJson?.message || errJson?.error || errDetail;
            } catch {
              // Ignore non-JSON error body
            }
            throw new Error(errDetail);
          }

          const blob = await response.blob();
          if (!blob || blob.size === 0) {
            throw new Error('ElevenLabs returned an empty audio stream.');
          }

          const blobUrl = URL.createObjectURL(blob);
          this.audioCache.set(cacheKey, blobUrl);
          return blobUrl;
        })();

        this.inFlightRequests.set(cacheKey, fetchPromise);
      }

      const blobUrl = await fetchPromise.finally(() => {
        this.inFlightRequests.delete(cacheKey);
      });

      // If another speech request superseded this one while fetching, do not play stale audio
      if (this.activeAbortController !== abortController || abortController.signal.aborted) {
        return;
      }

      await this.playBlobUrl(blobUrl, cleanText, options);
    } catch (err) {
      if (abortController.signal.aborted) {
        return;
      }
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Lỗi kết nối dịch vụ giọng đọc ElevenLabs.';
      console.warn(
        `[GlobalElevenLabsTTS Notice] (Voice ID: ${GLOBAL_TTS_CONFIG.voiceId}): ${errMsg} — using browser audio fallback.`
      );
      this.speakOfflineFallback(cleanText, _lang, options);
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }
    }
  }

  private speakOfflineFallback(cleanText: string, lang = 'en-US', options?: SpeakOptions) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.updateState({ isLoading: false, isPlaying: false, isPaused: false });
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = Math.min(2.0, Math.max(0.5, (options?.rate ?? this.state.playbackRate) * 0.95));
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => /en-(GB|US)/i.test(v.lang) && /(Natural|Google|Daniel|Arthur|Ryan|Guy|Samantha)/i.test(v.name)) ||
        voices.find((v) => /^en/i.test(v.lang));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.onstart = () => {
        this.updateState({ isLoading: false, isPlaying: true, isPaused: false, currentText: cleanText, lastError: null });
        options?.onStart?.();
      };
      utterance.onend = () => {
        this.updateState({ isLoading: false, isPlaying: false, isPaused: false });
        options?.onEnd?.();
      };
      utterance.onerror = () => {
        this.updateState({ isLoading: false, isPlaying: false, isPaused: false });
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      this.updateState({ isLoading: false, isPlaying: false, isPaused: false });
    }
  }
}

export const globalTtsService = new GlobalElevenLabsTtsService();

export interface DictionaryPhoneticsResult {
  audioUk: string | null;
  audioUs: string | null;
  audioAny: string | null;
  ipaUk: string | null;
  ipaUs: string | null;
}

const dictionaryPhoneticsCache = new Map<string, DictionaryPhoneticsResult>();
const inFlightPhoneticsMap = new Map<string, Promise<DictionaryPhoneticsResult>>();

/**
 * Gọi nhẹ tới Free Dictionary API (https://api.dictionaryapi.dev/api/v2/entries/en/${word})
 * để ưu tiên lấy link file audio phát âm chuẩn Anh-Anh / Anh-Mỹ (phonetics[].audio) người thật.
 */
export async function fetchFreeDictionaryPhonetics(
  word: string
): Promise<DictionaryPhoneticsResult> {
  const cleanWord = word
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase();

  const emptyResult: DictionaryPhoneticsResult = {
    audioUk: null,
    audioUs: null,
    audioAny: null,
    ipaUk: null,
    ipaUs: null,
  };

  if (!cleanWord || /\s/.test(cleanWord)) {
    return emptyResult;
  }

  const cached = dictionaryPhoneticsCache.get(cleanWord);
  if (cached) return cached;

  const existingPromise = inFlightPhoneticsMap.get(cleanWord);
  if (existingPromise) return existingPromise;

  const promise = (async (): Promise<DictionaryPhoneticsResult> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3200);
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) {
        dictionaryPhoneticsCache.set(cleanWord, emptyResult);
        return emptyResult;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        dictionaryPhoneticsCache.set(cleanWord, emptyResult);
        return emptyResult;
      }

      let audioUk: string | null = null;
      let audioUs: string | null = null;
      let audioAny: string | null = null;
      let ipaUk: string | null = null;
      let ipaUs: string | null = null;

      for (const entry of data) {
        if (!ipaUk && typeof entry?.phonetic === 'string' && entry.phonetic.trim()) {
          ipaUk = entry.phonetic.trim();
        }
        const phonetics = Array.isArray(entry?.phonetics) ? entry.phonetics : [];
        for (const p of phonetics) {
          const rawAudio = typeof p?.audio === 'string' ? p.audio.trim() : '';
          const rawText = typeof p?.text === 'string' ? p.text.trim() : '';
          const normalizedAudio = rawAudio.startsWith('//') ? `https:${rawAudio}` : rawAudio;

          if (normalizedAudio) {
            if (!audioAny) audioAny = normalizedAudio;
            if (/-uk\.mp3|_gb_|british/i.test(normalizedAudio)) {
              if (!audioUk) audioUk = normalizedAudio;
              if (rawText && !ipaUk) ipaUk = rawText;
            } else if (/-us\.mp3|_us_|american/i.test(normalizedAudio)) {
              if (!audioUs) audioUs = normalizedAudio;
              if (rawText && !ipaUs) ipaUs = rawText;
            }
          }
          if (rawText) {
            if (!ipaUk) ipaUk = rawText;
            else if (!ipaUs && rawText !== ipaUk) ipaUs = rawText;
          }
        }
      }

      const result: DictionaryPhoneticsResult = {
        audioUk: audioUk || audioAny,
        audioUs: audioUs || audioAny,
        audioAny,
        ipaUk,
        ipaUs: ipaUs || ipaUk,
      };
      dictionaryPhoneticsCache.set(cleanWord, result);
      return result;
    } catch {
      return emptyResult;
    } finally {
      inFlightPhoneticsMap.delete(cleanWord);
    }
  })();

  inFlightPhoneticsMap.set(cleanWord, promise);
  return promise;
}

/**
 * Primary Global TTS entrypoint used across the entire MASTER ENGLISH website.
 * - Với từ đơn lẻ: Ưu tiên phát file MP3 giọng người thật từ Free Dictionary API (Oxford/Cambridge),
 *   nếu không có mạng hoặc API không trả về audio thì fallback về hệ thống TTS / window.speechSynthesis.
 */
export function speakWord(text: string, lang = 'en-US', options?: SpeakOptions) {
  const clean = extractPureEnglish(text);
  if (!clean) return;

  if (!/\s/.test(clean) && typeof window !== 'undefined') {
    void (async () => {
      try {
        const phonetics = await fetchFreeDictionaryPhonetics(clean);
        const preferredUrl =
          /en-GB/i.test(lang)
            ? phonetics.audioUk || phonetics.audioAny
            : phonetics.audioUs || phonetics.audioAny;

        if (preferredUrl) {
          globalTtsService.stop();
          const audio = new Audio(preferredUrl);
          audio.playbackRate = options?.rate ?? globalTtsService.getPlaybackRate();
          options?.onStart?.();
          audio.onended = () => options?.onEnd?.();
          await audio.play();
          return;
        }
      } catch {
        // Fallback seamlessly to globalTtsService / window.speechSynthesis
      }
      void globalTtsService.speak(clean, lang, options);
    })();
    return;
  }

  void globalTtsService.speak(clean, lang, options);
}

export const speakText = speakWord;

export function stopSpeech() {
  globalTtsService.stop();
}

export function pauseSpeech() {
  globalTtsService.pause();
}

export function resumeSpeech() {
  globalTtsService.resume();
}

export function replaySpeech(options?: SpeakOptions) {
  globalTtsService.replay(options);
}

export function setSpeechRate(rate: number) {
  globalTtsService.setPlaybackRate(rate);
}

export function getSpeechRate(): number {
  return globalTtsService.getPlaybackRate();
}

export function subscribeTtsState(listener: (state: GlobalTtsState) => void): () => void {
  return globalTtsService.subscribe(listener);
}
