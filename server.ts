import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSharedGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ============================================================================
// CENTRAL ELEVENLABS TTS CONFIGURATION (SINGLE SOURCE OF TRUTH ON BACKEND)
// ============================================================================
const DEFAULT_ELEVENLABS_VOICE_ID =
  (process.env.ELEVENLABS_VOICE_ID || 'NaMUH1vcebhHvD4z3Lku').trim();
const DEFAULT_ELEVENLABS_MODEL_ID =
  (process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2').trim();

// Server-side in-memory audio buffer cache (LRU up to 500 entries)
const ttsBufferCache = new Map<string, Buffer>();
const MAX_TTS_CACHE_ITEMS = 500;

function getElevenLabsApiKey(): string {
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

function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
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

async function fetchFallbackMp3Buffer(cleanText: string): Promise<Buffer | null> {
  try {
    const chunks = splitTextIntoChunks(cleanText, 180);
    const buffers: Buffer[] = [];

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

function cacheAudioBuffer(cacheKey: string, audioBuffer: Buffer) {
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

  // Health check endpoint for Cloud Run
  app.get('/_health', (_req, res) => {
    res.status(200).send('OK');
  });

  // --------------------------------------------------------------------------
  // Global ElevenLabs TTS Status Endpoint (Never exposes the API key)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Global ElevenLabs Text-to-Speech Proxy Endpoint
  // Voice ID: NaMUH1vcebhHvD4z3Lku
  // --------------------------------------------------------------------------
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

      // 1. Serve immediately from server-side buffer cache if available
      const cachedBuffer = ttsBufferCache.get(cacheKey);
      if (cachedBuffer) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('X-TTS-Provider', apiKey ? 'elevenlabs' : 'elevenlabs-fallback-stream');
        res.setHeader('X-TTS-Voice-Id', voiceId);
        res.setHeader('X-TTS-Cache', 'HIT');
        return res.status(200).send(cachedBuffer);
      }

      // 2. Primary Path: ElevenLabs API with Voice ID NaMUH1vcebhHvD4z3Lku
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

      // 3. Resilient Server Audio Stream when ELEVENLABS_API_KEY is not yet set in Secrets
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

  // AI Essay Evaluation endpoint (if GEMINI_API_KEY is available)
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

  // --------------------------------------------------------------------------
  // AI Harness Engineering Endpoint (Model Router + RAG + Function Calling)
  // --------------------------------------------------------------------------
  const EDITORIAL_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
    {
      name: 'navigateToEditorialSection',
      description:
        'Điều hướng người dùng sang một trong 13 chuyên mục của Tòa Soạn MASTER English.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          targetTabId: {
            type: Type.STRING,
            description:
              'Mã chuyên mục: trang_nhat, kho_chu, ky_xuat_ban, quy_chuan, the_ho_so, phoi_ngu, tham_dinh, so_do_lien_doi, chuyen_de, tong_kho, ban_dinh_chinh, bao_cao, the_nha_bao',
          },
          filterKeyword: {
            type: Type.STRING,
            description: 'Từ khóa cần lọc khi mở chuyên mục (tùy chọn).',
          },
        },
        required: ['targetTabId'],
      },
    },
    {
      name: 'saveItemToArchiveDossier',
      description: 'Lưu một từ vựng, phối ngữ hoặc cấu trúc vào Thẻ Hồ Sơ Lưu Trữ.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemType: {
            type: Type.STRING,
            description: 'Loại mục lưu: vocab, structure, hoặc collocation',
          },
          title: {
            type: Type.STRING,
            description: 'Từ vựng hoặc tên cấu trúc',
          },
          content: {
            type: Type.STRING,
            description: 'Nghĩa tiếng Việt hoặc công thức',
          },
          note: {
            type: Type.STRING,
            description: 'Ghi chú ngữ cảnh học thuật',
          },
        },
        required: ['itemType', 'title', 'content'],
      },
    },
    {
      name: 'addErrataToRedPenDesk',
      description: 'Ghi nhận lỗi sai từ vựng hoặc ngữ pháp vào Bản Đính Chính (Bàn Biên Tập Bút Đỏ).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: 'Từ hoặc cấu trúc bị nhầm' },
          wrongMeaning: { type: Type.STRING, description: 'Nghĩa hoặc đáp án bị nhầm' },
          correctMeaning: { type: Type.STRING, description: 'Nghĩa hoặc đáp án chuẩn xác' },
          memoryNote: { type: Type.STRING, description: 'Mẹo ghi nhớ thực chiến' },
        },
        required: ['word', 'correctMeaning'],
      },
    },
    {
      name: 'updateSyntaxRuleStatus',
      description: 'Đánh dấu trạng thái Đã thuộc (mastered) hoặc Đã lưu (saved) cho một Quy Chuẩn Hành Văn (#1-#101).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          ruleIndexOrCode: {
            type: Type.STRING,
            description: 'Số thứ tự cấu trúc (ví dụ "23" hoặc "pdf-struct-23")',
          },
          newStatus: {
            type: Type.STRING,
            description: 'Trạng thái mới: mastered hoặc saved',
          },
        },
        required: ['ruleIndexOrCode', 'newStatus'],
      },
    },
    {
      name: 'clearResolvedErrata',
      description: 'Xóa một bản đính chính đã sửa xong khỏi Bàn Biên Tập Bút Đỏ.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          errataId: {
            type: Type.STRING,
            description: 'Số thứ tự ERRATA (ví dụ "1") hoặc từ vựng cần xóa',
          },
        },
        required: ['errataId'],
      },
    },
    {
      name: 'controlFocusTimerSession',
      description: 'Điều khiển đồng hồ quả quýt tập trung (pause, resume, change_target, end_and_save).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: 'Hành động: pause, resume, change_target, hoặc end_and_save',
          },
          targetMinutes: {
            type: Type.NUMBER,
            description: 'Số phút mục tiêu mới (nếu action là change_target)',
          },
        },
        required: ['action'],
      },
    },
    {
      name: 'getEditorialProgressSummary',
      description: 'Lấy báo cáo tiến độ học tập, Streak, XP và Kỳ Xuất Bản hiện tại của học viên.',
      parameters: {
        type: Type.OBJECT,
        properties: {},
      },
    },
  ];

  app.post('/api/ai-harness', async (req, res) => {
    try {
      const { prompt, systemInstruction, routedModel, enableTools } = req.body || {};
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'MISSING_PROMPT' });
      }

      const ai = getSharedGeminiClient();
      if (!ai) {
        return res.status(503).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });
      }

      const modelName =
        routedModel === 'gemini-2.5-pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          systemInstruction:
            typeof systemInstruction === 'string' && systemInstruction.trim()
              ? systemInstruction
              : undefined,
          temperature: 0.3,
          tools: enableTools
            ? [{ functionDeclarations: EDITORIAL_FUNCTION_DECLARATIONS }]
            : undefined,
        },
      });

      const functionCalls = (response.functionCalls || []).map((fc, idx) => ({
        id: fc.id || `fc_${Date.now()}_${idx}`,
        name: fc.name || '',
        args: (fc.args as Record<string, any>) || {},
      }));

      return res.json({
        text: response.text || '',
        routedModel: modelName,
        functionCalls,
      });
    } catch (err: any) {
      console.error('[AI Harness Endpoint Error]:', err?.message || err);
      return res.status(500).json({
        error: 'AI_HARNESS_ERROR',
        message: err?.message || 'Failed to execute Gemini harness query',
      });
    }
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

  app.get('/manifest.json', (_req, res) => {
    const manifestInDist = path.join(distPath, 'manifest.json');
    const manifestInPublic = path.join(publicPath, 'manifest.json');
    const targetFile = fs.existsSync(manifestInDist) ? manifestInDist : manifestInPublic;

    if (fs.existsSync(targetFile)) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      return res.status(200).sendFile(targetFile);
    }
    return res.status(404).send('manifest.json not found');
  });

  // Explicit handlers with fresh revalidation headers for favicon and app icons (scholar cat)
  app.get(
    [
      '/favicon.ico',
      '/favicon.png',
      '/apple-touch-icon.png',
      '/assets/brand/favicon.png',
      '/assets/brand/favicon.ico',
      '/assets/brand/favicon-32x32.png',
      '/assets/brand/favicon-16x16.png',
      '/assets/brand/cat_cutout_clean.png',
    ],
    (req, res) => {
      const relPath = req.path.replace(/^\/+/, '');
      const distFile = path.join(distPath, relPath);
      const publicFile = path.join(publicPath, relPath);
      const targetFile = fs.existsSync(publicFile)
        ? publicFile
        : fs.existsSync(distFile)
        ? distFile
        : null;

      if (targetFile) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        if (req.path.endsWith('.ico')) {
          res.setHeader('Content-Type', 'image/x-icon');
        } else if (req.path.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        }
        return res.sendFile(targetFile);
      }
      return res.status(404).send('Icon not found');
    }
  );

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
