/**
 * Retry utility with exponential backoff and jitter.
 *
 * Wraps any async operation and retries it on transient failures.
 * Non-retryable errors (client errors 4xx) are thrown immediately.
 */

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxAttempts?: number;
  /** Base delay in ms for the first retry. Default: 500 */
  baseDelay?: number;
  /** Maximum delay cap in ms. Default: 10_000 */
  maxDelay?: number;
  /** Custom predicate to decide if an error is retryable. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/** Appwrite HTTP status codes that indicate a client error — don't retry these. */
const NON_RETRYABLE_CODES = new Set([400, 401, 403, 404, 409]);

function defaultShouldRetry(error: unknown): boolean {
  if (error && typeof error === "object") {
    const code = (error as { code?: number }).code;
    if (typeof code === "number" && NON_RETRYABLE_CODES.has(code)) {
      return false;
    }
  }
  return true;
}

/**
 * Executes `fn` up to `maxAttempts` times.
 * Between attempts, waits for `baseDelay * 2^(attempt-1)` ms (+ up to 10% jitter).
 *
 * @example
 * const result = await withRetry(() => databases.listDocuments({ ... }));
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 500,
    maxDelay = 10_000,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLast = attempt === maxAttempts;
      const retryable = shouldRetry(error, attempt);

      if (isLast || !retryable) {
        throw error;
      }

      const exponential = baseDelay * Math.pow(2, attempt - 1);
      const capped = Math.min(exponential, maxDelay);
      const jitter = Math.random() * capped * 0.1;
      const delay = Math.round(capped + jitter);

      console.warn(
        `[retry] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms…`,
        error instanceof Error ? error.message : error
      );

      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
