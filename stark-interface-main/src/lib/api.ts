/**
 * API integration module for OpenAI Realtime and other services
 */
import type { RealtimeEvent } from '@/types';

/**
 * OpenAI Realtime session manager
 */
export class RealtimeSessionManager {
  private sessionId: string | null = null;
  private clientSecret: string | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Create a new realtime session
   */
  async createSession(): Promise<{ sessionId: string; clientSecret: string }> {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const data = await response.json() as {
      id: string;
      client_secret: { value: string };
    };

    this.sessionId = data.id;
    this.clientSecret = data.client_secret.value;

    return {
      sessionId: this.sessionId,
      clientSecret: this.clientSecret,
    };
  }

  /**
   * Get current session
   */
  getSession(): { sessionId: string | null; clientSecret: string | null } {
    return {
      sessionId: this.sessionId,
      clientSecret: this.clientSecret,
    };
  }

  /**
   * Close session
   */
  closeSession(): void {
    this.sessionId = null;
    this.clientSecret = null;
  }
}

/**
 * Embedding service for semantic search
 */
export class EmbeddingService {
  private apiKey: string;
  private model: 'text-embedding-3-small' | 'text-embedding-3-large';
  private cache: Map<string, number[]>;

  constructor(apiKey: string, model: 'text-embedding-3-small' | 'text-embedding-3-large' = 'text-embedding-3-small') {
    this.apiKey = apiKey;
    this.model = model;
    this.cache = new Map();
  }

  /**
   * Generate embedding for text
   */
  async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${response.statusText}`);
    }

    const data = await response.json() as { data: Array<{ embedding: number[] }> };
    const embedding = data.data[0].embedding;

    // Cache the result
    this.cache.set(text, embedding);

    // Limit cache size
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return embedding;
  }

  /**
   * Batch generate embeddings
   */
  async getBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embeddings: ${response.statusText}`);
    }

    const data = await response.json() as {
      data: Array<{ embedding: number[]; index: number }>;
    };

    // Sort by index to maintain order
    return data.data
      .sort((a, b) => a.index - b.index)
      .map(item => item.embedding);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Chat completion service
 */
export class ChatCompletionService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Send message to Claude/GPT and get response
   */
  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    temperature: number = 0.7
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get response: ${response.statusText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices[0].message.content;
  }
}
