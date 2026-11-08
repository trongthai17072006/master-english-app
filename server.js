import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_ELEVENLABS_VOICE_ID =
  (process.env.ELEVENLABS_VOICE_ID || 'NaMUH1vcebhHvD4z3Lku').trim();
const DEFAULT_ELEVENLABS_MODEL_ID =
  (process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2').trim();

const ttsBufferCache = new Map();
const MAX_TTS_CACHE_ITEMS = 500;

function getElevenLabsApiKey() {
  const key = (
    process.env.ELEVENLABS_API_KEY ||
    process.env.XI_API_KEY ||
    ''
  ).trim();
  if (!key || key === 'YOUR_ELEVENLABS_API_KEY' || key === 'MY_ELEVENLABS_API_KEY') {
    return '';
  }
  return key;
}

function splitTextIntoChunks(text, maxLen = 180) {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        const words = trimmed.split(/\s+/);
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).trim().length <= maxLen) {
            wordChunk = (wordChunk + ' ' + w).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        current = wordChunk;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

async function fetchFallbackMp3Buffer(cleanText) {
  try {
    const chunks = splitTextIntoChunks(cleanText, 180);
    const buffers = [];

    for (const chunk of chunks) {
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(
        chunk
      )}`;
      const resp = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });
      if (!resp.ok) {
        return null;
      }
      const arr = await resp.arrayBuffer();
      if (arr.byteLength > 0) {
        buffers.push(Buffer.from(arr));
      }
    }

    if (buffers.length === 0) return null;
    return Buffer.concat(buffers);
  } catch {
    return null;
  }
}

function cacheAudioBuffer(cacheKey, audioBuffer) {
  if (audioBuffer.byteLength <= 0) return;
  if (ttsBufferCache.size >= MAX_TTS_CACHE_ITEMS) {
    const oldestKey = ttsBufferCache.keys().next().value;
    if (oldestKey) ttsBufferCache.delete(oldestKey);
  }
  ttsBufferCache.set(cacheKey, audioBuffer);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/_health', (_req, res) => {
    res.status(200).send('OK');
  });

  app.get('/api/tts/status', (_req, res) => {
    const apiKey = getElevenLabsApiKey();
    res.json({
      provider: 'elevenlabs',
      voiceId: DEFAULT_ELEVENLABS_VOICE_ID,
      modelId: DEFAULT_ELEVENLABS_MODEL_ID,
      configured: Boolean(apiKey),
      cacheSize: ttsBufferCache.size,
    });
  });

  app.post('/api/tts', async (req, res) => {
    try {
      const rawText = typeof req.body?.text === 'string' ? req.body.text : '';
      const cleanText = rawText.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();

      if (!cleanText) {
        return res.status(400).json({
          error: 'MISSING_TEXT',
          message: 'No text provided for speech synthesis.',
        });
      }

      const voiceId = DEFAULT_ELEVENLABS_VOICE_ID;
      const modelId = DEFAULT_ELEVENLABS_MODEL_ID;
      const apiKey = getElevenLabsApiKey();
      const cacheKey = `${apiKey ? voiceId : 'fallback-en'}:${modelId}:${cleanText.toLowerCase()}`;

      const cachedBuffer = ttsBufferCache.get(cacheKey);
      if (cachedBuffer) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('X-TTS-Provider', apiKey ? 'elevenlabs' : 'elevenlabs-fallback-stream');
        res.setHeader('X-TTS-Voice-Id', voiceId);
        res.setHeader('X-TTS-Cache', 'HIT');
        return res.status(200).send(cachedBuffer);
      }

      if (apiKey) {
        const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
          voiceId
        )}?output_format=mp3_44100_128`;

        const upstreamResponse = await fetch(elevenLabsUrl, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        });

        if (upstreamResponse.ok) {
          const arrayBuffer = await upstreamResponse.arrayBuffer();
          const audioBuffer = Buffer.from(arrayBuffer);
          cacheAudioBuffer(cacheKey, audioBuffer);

          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('X-TTS-Provider', 'elevenlabs');
          res.setHeader('X-TTS-Voice-Id', voiceId);
          res.setHeader('X-TTS-Cache', 'MISS');
          return res.status(200).send(audioBuffer);
        } else {
          const errText = await upstreamResponse.text().catch(() => '');
          console.warn(
            `[ElevenLabs TTS Upstream Notice] status=${upstreamResponse.status} voiceId=${voiceId}: ${errText.slice(0, 200)}`
          );
        }
      }

      const fallbackBuffer = await fetchFallbackMp3Buffer(cleanText);
      if (fallbackBuffer && fallbackBuffer.byteLength > 0) {
        cacheAudioBuffer(cacheKey, fallbackBuffer);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('X-TTS-Provider', 'elevenlabs-fallback-stream');
        res.setHeader('X-TTS-Voice-Id', voiceId);
        res.setHeader('X-TTS-Cache', 'MISS');
        return res.status(200).send(fallbackBuffer);
      }

      return res.status(503).json({
        error: 'ELEVENLABS_API_KEY_MISSING',
        voiceId,
        message:
          'ELEVENLABS_API_KEY is not configured in Backend Environment Variables / Secrets.',
      });
    } catch (err) {
      console.error('[ElevenLabs TTS Proxy Exception]:', err);
      return res.status(500).json({
        error: 'TTS_INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Unknown TTS server error',
      });
    }
  });

  app.post('/api/evaluate-essay', async (req, res) => {
    try {
      const { essay, prompt, questionType } = req.body;
      if (!essay || typeof essay !== 'string') {
        return res.status(400).json({ error: 'No essay content provided' });
      }

      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an official Senior IELTS Examiner. Evaluate this IELTS Writing Task 2 essay strictly according to the 4 official IELTS criteria: Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.

Prompt: ${prompt}
Question Type: ${questionType}

Essay:
${essay}

Return a valid JSON object ONLY with the following exact keys:
{
  "estimatedBand": number,
  "wordCountScore": string,
  "taskResponse": string,
  "coherenceCohesion": string,
  "lexicalResource": string,
  "grammaticalAccuracy": string,
  "strengths": string[],
  "actionableAdvice": string[]
}`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text.trim());
        return res.json(parsed);
      }
    } catch (err) {
      console.error('Server AI evaluation error:', err);
    }

    return res.status(404).json({ fallback: true });
  });

  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(__dirname, 'public');

  // Explicit handlers for SEO / Google Search Console crawler files
  // Serves valid XML / text before any SPA fallback or middleware can intercept
  app.get('/sitemap.xml', (_req, res) => {
    const sitemapInDist = path.join(distPath, 'sitemap.xml');
    const sitemapInPublic = path.join(publicPath, 'sitemap.xml');
    const targetFile = fs.existsSync(sitemapInDist) ? sitemapInDist : sitemapInPublic;

    if (fs.existsSync(targetFile)) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.status(200).sendFile(targetFile);
    }
    return res.status(404).send('Sitemap not found');
  });

  app.get('/robots.txt', (_req, res) => {
    const robotsInDist = path.join(distPath, 'robots.txt');
    const robotsInPublic = path.join(publicPath, 'robots.txt');
    const targetFile = fs.existsSync(robotsInDist) ? robotsInDist : robotsInPublic;

    if (fs.existsSync(targetFile)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).sendFile(targetFile);
    }
    return res.status(404).send('robots.txt not found');
  });

  const isProd =
    process.env.NODE_ENV === 'production' &&
    fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Server running on http://0.0.0.0:${PORT} [ElevenLabs Voice ID: ${DEFAULT_ELEVENLABS_VOICE_ID}]`
    );
  });
}

startServer();
