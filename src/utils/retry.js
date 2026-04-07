import logger from "./logger.js";

/**
 * Retry mechanism with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Max retry attempts
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(
  fn,
  maxAttempts = 3,
  initialDelay = 1000,
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Simple delay helper
 * @param {number} ms - Milliseconds to delay
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
