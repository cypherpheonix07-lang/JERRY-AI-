import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ToolResult } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 5,
  baseDelayMs: number = 100,
  timeout: number = 30000
): Promise<T> {
  let lastError: Error | null = null;
  const startTime = Date.now();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error(`Operation timed out after ${timeout}ms`);
      }

      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts - 1) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("All retry attempts failed");
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const timeout = options.timeout || 30000;
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Execute a tool with timeout and error handling
 */
export async function executeTool(
  toolId: string,
  input: unknown,
  handler: (input: unknown) => Promise<ToolResult>,
  timeout: number = 30000
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const result = await Promise.race([
      handler(input),
      new Promise<ToolResult>((_, reject) =>
        controller.signal.addEventListener("abort", () =>
          reject(new Error(`Tool execution timeout after ${timeout}ms`))
        )
      ),
    ]);

    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return {
      toolId,
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }
}

/**
 * Sanitize and validate input for security
 */
export function sanitizeInput(input: string): string {
  return input
    .slice(0, 10000) // Limit length
    .replace(/[<>"']/g, "") // Remove potentially harmful characters
    .trim();
}

/**
 * Format error for user display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

/**
 * Type guard for checking if value is Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard for checking if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard for checking if value is object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends unknown[], R>(
  fn: (...args: T) => R,
  delayMs: number
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends unknown[], R>(
  fn: (...args: T) => R,
  limitMs: number
): (...args: T) => void {
  let lastCallTime = 0;

  return (...args: T) => {
    const now = Date.now();
    if (now - lastCallTime >= limitMs) {
      fn(...args);
      lastCallTime = now;
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
