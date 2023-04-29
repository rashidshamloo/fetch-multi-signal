import { fetchMS, fetchMSAlt } from '.';
import events from 'events';

/* A note about open handles:
 *
 * Jest sometimes give this warning:
 *   " Jest did not exit one second after the test run has completed.
 *     'This usually means that there are asynchronous operations that weren't stopped in your tests.
 *     Consider running Jest with `--detectOpenHandles` to troubleshoot this issue. "
 *
 * After using `--detectOpenHandles`, Jest detects all fetch requests as open handles:
 *   " Jest has detected the following X open handles potentially keeping Jest from exiting "
 *
 * At first i thought it had something to do with my implementation,
 * but the same thing happens when using vanilla `fetch()` as well.
 * so it's some underlying issue with fetch beyond my control.
 * it may or may not get fixed in the future by the Fetch API / Node.js devs.
 * i have added `--forceExit` to Jest as a workaround for now.
 */

// test url
const url = 'https://github.com/rashidshamloo';

// fetchMS()
describe('fetchMS(): Testing different abort methods', () => {
  test('Abort using timeout (10ms)', async () => {
    await expect(() => fetchMS(url, { timeout: 10 })).rejects.toThrowError(
      /timeout/i
    );
  }, 500);

  test('Abort using controller.abort()', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 10);
    await expect(() => fetchMS(url, { signal })).rejects.toThrow(/abort/i);
  }, 500);

  test('Abort using already aborted signal', async () => {
    const expectedError = new DOMException('Any reason', 'AbortError');
    const controller = new AbortController();
    const signal = controller.signal;
    controller.abort(expectedError);
    await expect(() => fetchMS(url, { signal })).rejects.toThrow(expectedError);
  }, 500);

  test('Abort using timeout (10ms) | signals = Array(2) | no signal ', async () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const signals = [controller1.signal, controller2.signal];
    await expect(() => fetchMS(url, { timeout: 10, signals })).rejects.toThrow(
      /timeout/i
    );
    controller1.abort();
    controller2.abort();
  }, 500);

  test('Abort using timeout (10ms) | signals = Array(2) | with signal ', async () => {
    const controller = new AbortController();
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const signal = controller.signal;
    const signals = [controller1.signal, controller2.signal];
    await expect(() =>
      fetchMS(url, { timeout: 10, signal, signals })
    ).rejects.toThrow(/timeout/i);
    controller.abort();
    controller1.abort();
    controller2.abort();
  }, 500);

  test('Abort using signal No.3 (10ms) | signals = Array(5) | no signal ', async () => {
    const controller = new AbortController();
    let signals: Array<AbortSignal> = [];
    for (let i = 0; i < 5; i++)
      signals.push(i !== 2 ? new AbortController().signal : controller.signal);
    setTimeout(() => controller.abort(), 10);
    await expect(() => fetchMS(url, { signals })).rejects.toThrow(/abort/i);
  }, 500);

  test('Abort using signal No.3 (10ms) | signals = Array(5) | with signal ', async () => {
    const signal = new AbortController().signal;
    const controller = new AbortController();
    let signals: Array<AbortSignal> = [];
    for (let i = 0; i < 5; i++)
      signals.push(i !== 2 ? new AbortController().signal : controller.signal);
    setTimeout(() => controller.abort(), 10);
    await expect(() => fetchMS(url, { signal, signals })).rejects.toThrow(
      /abort/i
    );
  }, 500);
});

// fetchMSAlt()
describe('fetchMSAlt(): Testing different abort methods', () => {
  test('Abort using timeout (10ms)', async () => {
    const expectedError = new DOMException(
      'signal timed out (10ms)',
      'TimeoutError'
    );
    await expect(() => fetchMSAlt(url, { timeout: 10 })).rejects.toThrowError(
      expectedError
    );
  }, 500);

  test('Abort using controller.abort()', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 10);
    await expect(() => fetchMSAlt(url, { signal })).rejects.toThrow(/abort/i);
  }, 500);

  test('Abort using already aborted signal', async () => {
    const expectedError = new DOMException('Any reason', 'AbortError');
    const controller = new AbortController();
    const signal = controller.signal;
    controller.abort(expectedError);
    await expect(() => fetchMSAlt(url, { signal })).rejects.toThrow(
      expectedError
    );
  }, 500);

  test('Abort using timeout (10ms) | signals = Array(2) | no signal ', async () => {
    const expectedError = new DOMException(
      'signal timed out (10ms)',
      'TimeoutError'
    );
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const signals = [controller1.signal, controller2.signal];
    await expect(() =>
      fetchMSAlt(url, { timeout: 10, signals })
    ).rejects.toThrow(expectedError);
  }, 500);

  test('Abort using timeout (10ms) | signals = Array(2) | with signal ', async () => {
    const expectedError = new DOMException(
      'signal timed out (10ms)',
      'TimeoutError'
    );
    const controller = new AbortController();
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const signal = controller.signal;
    const signals = [controller1.signal, controller2.signal];
    await expect(() =>
      fetchMSAlt(url, { timeout: 10, signal, signals })
    ).rejects.toThrow(expectedError);
  }, 500);

  test('Abort using signal No.3 (10ms) | signals = Array(5) | no signal ', async () => {
    const controller = new AbortController();
    let signals: Array<AbortSignal> = [];
    for (let i = 0; i < 5; i++)
      signals.push(i !== 2 ? new AbortController().signal : controller.signal);
    setTimeout(() => controller.abort(), 10);
    await expect(() => fetchMSAlt(url, { signals })).rejects.toThrow(/abort/i);
  }, 500);

  test('Abort using signal No.3 (10ms) | signals = Array(5) | with signal ', async () => {
    const signal = new AbortController().signal;
    const controller = new AbortController();
    let signals: Array<AbortSignal> = [];
    for (let i = 0; i < 5; i++)
      signals.push(i !== 2 ? new AbortController().signal : controller.signal);
    setTimeout(() => controller.abort(), 10);
    await expect(() => fetchMSAlt(url, { signal, signals })).rejects.toThrow(
      /abort/i
    );
  }, 500);
});

describe('fetchMS() and fetchMSAlt(): Testing with 100 signals', () => {
  events.setMaxListeners(102);

  test('fetchMS() - Abort using timeout (10ms) - signals = Array(100) - no max listener warning should be shown', async () => {
    let signals: Array<AbortSignal> = [];
    for (let i = 0; i < 100; i++) signals.push(new AbortController().signal);
    await expect(() =>
      fetchMS(url, { timeout: 10, signals })
    ).rejects.toThrowError(/timeout/i);
  }, 500);

  test('fetchMSAlt() - Abort using timeout (10ms) - signals = Array(100) - no max listener warning should be shown', async () => {
    const expectedError = new DOMException(
      'signal timed out (10ms)',
      'TimeoutError'
    );
    let signals: Array<AbortSignal> = [];
    for (let i = 0; i < 100; i++) signals.push(new AbortController().signal);
    await expect(() =>
      fetchMSAlt(url, { timeout: 10, signals })
    ).rejects.toThrowError(expectedError);
  }, 500);
});
