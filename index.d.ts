/**
 * Adds timeout and signals to RequestInit interface
 *
 * timeout?: number
 *
 * signals?: AbortSignal[ ]
 */
export interface RequestInitMS extends RequestInit {
  timeout?: number;
  signals?: Array<AbortSignal>;
}

/**
 * Adds timeout and multiple signals to fetch(). will be aborted if any of the signals are aborted.
 * can be used as a drop-in replacement for fetch().
 *
 * fetchMS( url, { timeout: milliseconds, signals: [ signal1, signal2, ... ] } )
 *
 * @note
 *
 * Uses AbortSignal.timeout() to create a timeout signal.
 */
export const fetchMS: (
  input: RequestInfo | URL,
  init?: RequestInitMS
) => Promise<Response>;

/**
 * Adds timeout and multiple signals to fetch(). will be aborted if any of the signals are aborted.
 * can be used as a drop-in replacement for fetch().
 *
 * fetchMS( url, { timeout: milliseconds, signals: [ signal1, signal2, ... ] } )
 *
 * @note
 *
 * Note: Uses setTimeout() to create a timeout signal.
 */
export const fetchMSAlt: (
  input: RequestInfo | URL,
  init?: RequestInitMS
) => Promise<Response>;

export default fetchMS;
