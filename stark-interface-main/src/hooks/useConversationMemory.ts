/**
 * Hook for managing conversation memory and semantic search (RAG)
 * Integrates with pgvector for semantic similarity search
 */
import { useCallback, useRef } from 'react';
import { useConversationStore } from '@/store';
import type { ConversationMessage } from '@/types';

interface EmbeddingOptions {
  apiKey: string;
  model: 'text-embedding-3-small' | 'text-embedding-3-large';
}

interface MemoryConfig {
  maxMessages: number;
  enableRAG: boolean;
  searchLimit: number;
}

interface SemanticSearchResult {
  message: ConversationMessage;
  similarity: number;
}

const defaultConfig: MemoryConfig = {
  maxMessages: 1000,
  enableRAG: true,
  searchLimit: 5,
};

/**
 * Generate embedding for text using OpenAI API
 */
async function generateEmbedding(
  text: string,
  options: EmbeddingOptions
): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.statusText}`);
  }

  const data = await response.json() as { data: Array<{ embedding: number[] }> };
  return data.data[0].embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vector dimensions must match');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Hook for managing conversation memory with semantic search
 */
export function useConversationMemory(
  embeddingOptions: EmbeddingOptions,
  config: Partial<MemoryConfig> = {}
): {
  searchMemory: (query: string) => Promise<SemanticSearchResult[]>;
  addToMemory: (message: ConversationMessage) => void;
  clearMemory: () => void;
  getRecentMessages: (limit: number) => ConversationMessage[];
} {
  const memoryConfig = { ...defaultConfig, ...config };
  const { messages, addMessage, clearMessages } = useConversationStore();
  const embeddingCacheRef = useRef<Map<string, number[]>>(new Map());

  /**
   * Search memory using semantic similarity
   */
  const searchMemory = useCallback(
    async (query: string): Promise<SemanticSearchResult[]> => {
      if (!memoryConfig.enableRAG || messages.length === 0) {
        return [];
      }

      try {
        // Generate query embedding
        const queryEmbedding = await generateEmbedding(query, embeddingOptions);

        // Score all messages
        const results: SemanticSearchResult[] = [];

        for (const message of messages) {
          let embedding = embeddingCacheRef.current.get(message.id);

          if (!embedding) {
            embedding = await generateEmbedding(message.content, embeddingOptions);
            embeddingCacheRef.current.set(message.id, embedding);
          }

          const similarity = cosineSimilarity(queryEmbedding, embedding);
          results.push({ message, similarity });
        }

        // Sort by similarity and return top results
        return results
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, memoryConfig.searchLimit);
      } catch (error) {
        console.error('Error searching memory:', error);
        return [];
      }
    },
    [messages, embeddingOptions, memoryConfig]
  );

  /**
   * Add message to memory (with pruning if needed)
   */
  const addToMemory = useCallback(
    (message: ConversationMessage): void => {
      addMessage(message);

      // Prune old messages if limit exceeded
      if (messages.length > memoryConfig.maxMessages) {
        const toRemove = messages.length - memoryConfig.maxMessages;
        // Keep most recent messages (FIFO removal of oldest)
        useConversationStore.setState(state => ({
          messages: state.messages.slice(toRemove),
        }));
      }
    },
    [addMessage, messages.length, memoryConfig.maxMessages]
  );

  /**
   * Get recent messages
   */
  const getRecentMessages = useCallback(
    (limit: number): ConversationMessage[] => {
      return messages.slice(-limit);
    },
    [messages]
  );

  return {
    searchMemory,
    addToMemory,
    clearMemory: clearMessages,
    getRecentMessages,
  };
}

/**
 * Hook for managing user preferences and learning
 */
export function useUserLearning(): {
  recordInteraction: (query: string, response: string) => void;
  getPreferredTopics: () => string[];
  getLearningContext: () => Record<string, unknown>;
} {
  const preferredTopicsRef = useRef<Set<string>>(new Set());

  const recordInteraction = useCallback((query: string, response: string): void => {
    // Extract keywords/topics from interaction
    const keywords = query.match(/\b\w{4,}\b/g) || [];
    keywords.forEach(keyword => {
      preferredTopicsRef.current.add(keyword.toLowerCase());
    });

    // Store in localStorage for persistence
    const stored = localStorage.getItem('preferred-topics') || '[]';
    const topics = JSON.parse(stored) as string[];
    const updated = Array.from(new Set([...topics, ...keywords])).slice(-50);
    localStorage.setItem('preferred-topics', JSON.stringify(updated));
  }, []);

  const getPreferredTopics = useCallback((): string[] => {
    const stored = localStorage.getItem('preferred-topics') || '[]';
    return JSON.parse(stored) as string[];
  }, []);

  const getLearningContext = useCallback((): Record<string, unknown> => {
    return {
      preferredTopics: getPreferredTopics(),
      interactionCount: (localStorage.getItem('interaction-count') || '0'),
      lastInteractionTime: localStorage.getItem('last-interaction-time'),
    };
  }, [getPreferredTopics]);

  return {
    recordInteraction,
    getPreferredTopics,
    getLearningContext,
  };
}
