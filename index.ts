/**
 * Adds timeout and signals to RequestInit interface
 *
 * timeout?: number
 *
 * signals?: AbortSignal[]
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
export const fetchMS = async (
  input: RequestInfo | URL,
  initMS?: RequestInitMS
) => {
  // if no options are provided, do regular fetch
  if (!initMS) return await fetch(input);
  let { timeout, signals, ...init } = initMS;
  // if no timeout or signals is provided, do regular fetch with options
  if (!timeout && !signals) return await fetch(input, init);
  signals ||= [];
  // if signal is empty and signals only has one item,
  // set signal to it and do regular fetch
  if (signals.length === 1 && !init.signal)
    return await fetch(input, { ...init, signal: signals[0] });
  // if signal is set, push to signals array
  init.signal && signals.push(init.signal);
  const controller = new AbortController();
  // timeout setup
  if (timeout) {
    const timeoutSignal = AbortSignal.timeout(timeout);
    signals.push(timeoutSignal);
  }
  // add event listener
  for (let i = 0, len = signals.length; i < len; i++) {
    // if signal is already aborted, abort timeout signal
    if (signals[i].aborted) {
      controller.abort(signals[i].reason);
      break;
    }
    // else add on signal abort: abort timeout signal
    signals[i].addEventListener(
      'abort',
      () => {
        controller.abort(signals![i].reason);
      },
      { signal: controller.signal }
    );
  }
  return await fetch(input, {
    ...init,
    signal: controller.signal,
  });
};

/**
 * Adds timeout and multiple signals to fetch(). will be aborted if any of the signals are aborted.
 * can be used as a drop-in replacement for fetch().
 *
 * fetchMS( url, { timeout: milliseconds, signals: [ signal1, signal2, ... ] } )
 *
 * @note
 *
 * Uses setTimeout() to create a timeout signal.
 */
export const fetchMSAlt = async (
  input: RequestInfo | URL,
  initMS?: RequestInitMS
) => {
  // if no options are provided, do regular fetch
  if (!initMS) return await fetch(input);
  let { timeout, signals, ...init } = initMS;
  // if no timeout or signals is provided, do regular fetch with options
  if (!timeout && !signals) return await fetch(input, init);
  signals ||= [];
  // if signal is empty and signals only has one item,
  // set signal to it and do regular fetch
  if (signals.length === 1 && !init.signal)
    return await fetch(input, { ...init, signal: signals[0] });
  // if signal is set, push to signals array
  init.signal && signals.push(init.signal);
  const controller = new AbortController();
  // timeout setup
  let timeoutId: ReturnType<typeof setTimeout>;
  if (timeout) {
    const reason = new DOMException(
      `signal timed out (${timeout}ms)`,
      'TimeoutError'
    );
    timeoutId = setTimeout(() => controller.abort(reason), timeout);
  }
  // add event listener
  for (let i = 0, len = signals.length; i < len; i++) {
    // if signal is already aborted, abort timeout signal
    if (signals[i].aborted) {
      controller.abort(signals[i].reason);
      break;
    }
    // else add on signal abort: abort timeout signal
    signals[i].addEventListener(
      'abort',
      () => {
        controller.abort(signals![i].reason);
        timeout && clearTimeout(timeoutId);
      },
      { signal: controller.signal }
    );
  }
  let res;
  try {
    res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    timeout && clearTimeout(timeoutId!);
  }
  return res;
};
