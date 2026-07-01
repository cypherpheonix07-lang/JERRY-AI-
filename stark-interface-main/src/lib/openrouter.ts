/**
 * J.A.R.V.I.S OpenRouter Client
 * Model routing, SSE streaming, system prompt building, memory extraction
 *
 * Model routing logic:
 *   sensitiveKeywords → llama-3-8b (local/private)
 *   hasImage → gpt-4o
 *   webKeywords (latest/news/today/price) → perplexity/sonar
 *   wordCount < 8 → llama-3-8b (speed)
 *   default → claude-sonnet-4
 *
 * Fallback chain: claude → llama-3-8b → cached response
 */

import { useJarvisStore } from '@/store/jarvisStore';
import { jarvisBus } from '@/lib/jarvisBus';

// ── Constants ──────────────────────────────────────────────────────────────

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const MODELS = {
  'claude-sonnet-4': 'anthropic/claude-sonnet-4',
  'gpt-4o': 'openai/gpt-4o',
  'perplexity-sonar': 'perplexity/llama-3.1-sonar-large-128k-online',
  'llama-3-8b': 'meta-llama/llama-3-8b-instruct',
} as const;

type ModelId = keyof typeof MODELS;

const SENSITIVE_KEYWORDS = [
  'password', 'secret', 'apikey', 'api key', 'token', 'private key',
  'bank', 'account', 'ssn', 'credit card', 'passport', 'address',
];

const WEB_KEYWORDS = [
  'latest', 'news', 'today', 'price', 'weather', 'forecast',
  'stock', 'crypto', 'bitcoin', 'trending', 'breaking',
  'score', 'match', 'election', 'poll',
];

// ── Routing ────────────────────────────────────────────────────────────────

function routeModel(query: string, hasImage = false): ModelId {
  const q = query.toLowerCase();

  if (hasImage) return 'gpt-4o';

  const isSensitive = SENSITIVE_KEYWORDS.some((kw) => q.includes(kw));
  if (isSensitive) return 'llama-3-8b';

  const needsWeb = WEB_KEYWORDS.some((kw) => q.includes(kw));
  if (needsWeb) return 'perplexity-sonar';

  const wordCount = q.split(/\s+/).length;
  if (wordCount < 8) return 'llama-3-8b';

  return 'claude-sonnet-4';
}

function getModelLabel(modelId: ModelId): string {
  const labels: Record<ModelId, string> = {
    'claude-sonnet-4': 'CLAUDE SONNET',
    'gpt-4o': 'GPT-4o',
    'perplexity-sonar': 'PERPLEXITY',
    'llama-3-8b': 'LLAMA 3',
  };
  return labels[modelId];
}

function getModelColor(modelId: ModelId): string {
  const colors: Record<ModelId, string> = {
    'claude-sonnet-4': 'bg-purple-500',
    'gpt-4o': 'bg-emerald-500',
    'perplexity-sonar': 'bg-orange-500',
    'llama-3-8b': 'bg-cyan-500',
  };
  return colors[modelId];
}

// ── System Prompt ──────────────────────────────────────────────────────────

export function buildSystemPrompt(context?: {
  userName?: string;
  time?: string;
  emotionalState?: string;
  recentEvents?: string[];
}): string {
  const store = useJarvisStore.getState();
  const now = new Date();
  const timeStr = context?.time ?? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const name = context?.userName ?? store.userName ?? 'Sir';

  const recentTasks = store.tasks
    .filter((t) => t.status === 'in-progress')
    .slice(0, 3)
    .map((t) => `- ${t.title}`)
    .join('\n');

  const serviceOnline = store.services.filter((s) => s.online).length;
  const serviceTotal = store.services.length;
  const memoryCount = store.memories.length;

  return `You are J.A.R.V.I.S — Just A Rather Very Intelligent System.
Created by Sixth. You are Tony Stark's personal AI operating system.

Identity: Calm, witty, ultra-competent. Address the user as "sir" or "${name}".
Tone: Professional with dry wit. Confident but never arrogant. Concise unless detail is requested.
YOU ARE NOT A CHATBOT. You are an operating system with a personality.

Current context:
- Date: ${dateStr}
- Time: ${timeStr}
- User: ${name}
- Emotional state: ${context?.emotionalState ?? 'Nominal'}
- Systems online: ${serviceOnline}/${serviceTotal}
- Active tasks:
${recentTasks || '  (none)'}
- Stored memories: ${memoryCount}
${context?.recentEvents?.length ? `- Recent events:\n${context.recentEvents.map((e) => `  • ${e}`).join('\n')}` : ''}

Capabilities:
- Full conversation, research, analysis
- OS control (files, apps, system)
- Web search and real-time data
- Memory and learning
- Task and project management
- Multi-platform social and communication
- Smart home control
- Health and wellness monitoring
- Financial tracking and analysis

Rules:
- Never mention that you are an AI language model
- Never use phrases like "As an AI" or "I don't have access to..."
- If you don't know something, say "I don't have that data, sir" — never apologize
- Keep responses under 200 words unless analysis is requested
- Use technical terminology naturally
- You may use emoji sparingly for emphasis`;
}

// ── Streaming Completion ───────────────────────────────────────────────────

export interface StreamParams {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  onToken: (token: string) => void;
  onComplete: (fullText: string, model: string, latency: number, tokens: number) => void;
  onError: (error: Error) => void;
  model?: ModelId;
  hasImage?: boolean;
  systemPrompt?: string;
  temperature?: number;
}

export async function streamCompletion(params: StreamParams): Promise<void> {
  const {
    messages,
    onToken,
    onComplete,
    onError,
    model: forcedModel,
    hasImage = false,
    systemPrompt,
    temperature = 0.7,
  } = params;

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('jarvis-openrouter-key');
  if (!apiKey) {
    onError(new Error('No OpenRouter API key configured, sir.'));
    return;
  }

  const modelId = forcedModel || routeModel(messages[messages.length - 1]?.content || '', hasImage);
  const modelPath = MODELS[modelId];
  const startTime = Date.now();

  // Update store
  const store = useJarvisStore.getState();
  store.setActiveModel(modelId);
  store.setIsThinking(true);
  jarvisBus.emit('model:changed', { modelId, label: getModelLabel(modelId) });

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://jarvis-stark.vercel.app',
        'X-Title': 'J.A.R.V.I.S',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelPath,
        messages: systemPrompt
          ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
          : [{ role: 'system' as const, content: buildSystemPrompt() }, ...messages],
        stream: true,
        temperature,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 200)}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              onToken(delta);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    }

    // Flush buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim();
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onToken(delta);
          }
        } catch { /* skip */ }
      }
    }

    // Fallback chain
    if (!fullText && modelId === 'claude-sonnet-4') {
      // Try llama-3-8b as fallback
      reader.cancel();
      return streamCompletion({ ...params, model: 'llama-3-8b' });
    }

    if (!fullText) {
      fullText = 'I apologize, sir — I encountered a processing error. Please try again.';
      onToken(fullText);
    }

    const latency = Date.now() - startTime;
    const tokens = Math.round(fullText.length / 4);

    store.setIsThinking(false);
    store.addTokens(tokens, tokens * 0.000003);
    onComplete(fullText, modelId, latency, tokens);
    jarvisBus.emit('jarvis:response', { text: fullText, model: modelId, latency });
  } catch (error) {
    store.setIsThinking(false);
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[OpenRouter] Error:', err.message);

    // Fallback: try llama on Claude failure
    if (modelId === 'claude-sonnet-4') {
      console.log('[OpenRouter] Falling back to llama-3-8b');
      return streamCompletion({ ...params, model: 'llama-3-8b' });
    }

    onError(err);
    jarvisBus.emit('system:error', { source: 'openrouter', error: err.message, recoverable: true });
  }
}

// ── Memory Extraction ──────────────────────────────────────────────────────

export function extractMemories(text: string): Array<{
  text: string;
  type: 'fact' | 'preference' | 'event' | 'decision' | 'emotion' | 'observation';
  category: string;
  confidence: number;
  tags: string[];
}> {
  const memories: Array<{
    text: string;
    type: 'fact' | 'preference' | 'event' | 'decision' | 'emotion' | 'observation';
    category: string;
    confidence: number;
    tags: string[];
  }> = [];

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (s.length < 10) continue;

    // Preference detection
    if (/\b(I|i) (like|love|prefer|enjoy|hate|dislike)\b/.test(s)) {
      memories.push({
        text: s,
        type: 'preference',
        category: 'preference',
        confidence: 0.8,
        tags: ['preference', ...extractTags(s)],
      });
    }

    // Fact detection
    if (/\b(I|i|we|they|he|she) (am|is|are|was|were|have|has|had|work|live|study)\b/.test(s)) {
      memories.push({
        text: s,
        type: 'fact',
        category: 'personal',
        confidence: 0.7,
        tags: ['fact', ...extractTags(s)],
      });
    }

    // Decision detection
    if (/\b(decided|chose|selected|picked|going to|will)\b/i.test(s)) {
      memories.push({
        text: s,
        type: 'decision',
        category: 'decision',
        confidence: 0.75,
        tags: ['decision', ...extractTags(s)],
      });
    }

    // Event detection
    if (/\b(today|yesterday|tomorrow|next|last|upcoming|scheduled|meeting|call|appointment)\b/i.test(s)) {
      memories.push({
        text: s,
        type: 'event',
        category: 'event',
        confidence: 0.8,
        tags: ['event', ...extractTags(s)],
      });
    }

    // Emotion detection
    if (/\b(feel|feeling|felt|happy|sad|angry|excited|worried|stressed|anxious)\b/i.test(s)) {
      memories.push({
        text: s,
        type: 'emotion',
        category: 'emotion',
        confidence: 0.65,
        tags: ['emotion', ...extractTags(s)],
      });
    }
  }

  return memories;
}

function extractTags(text: string): string[] {
  const common = ['work', 'home', 'health', 'family', 'project', 'meeting',
    'friend', 'travel', 'money', 'learning', 'goal', 'idea'];
  const lower = text.toLowerCase();
  return common.filter((tag) => lower.includes(tag));
}

// ── Quick Chat (non-streaming) ─────────────────────────────────────────────

export async function quickChat(
  message: string,
  context?: { userName?: string; time?: string }
): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullText = '';
    streamCompletion({
      messages: [{ role: 'user', content: message }],
      systemPrompt: buildSystemPrompt(context),
      onToken: (token) => { fullText += token; },
      onComplete: () => resolve(fullText),
      onError: reject,
    });
  });
}

export { routeModel, getModelColor, getModelLabel };
export type { ModelId };
