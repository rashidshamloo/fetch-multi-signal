<h1 align="center">
   <b>
        Fetch Multi Signal<br>
    </b>
</h1>

<p align="center">Use multiple AbortSignals with the Fetch API</p>

<p align="center">
    <a href="https://dev.to/rashidshamloo/adding-timeout-and-multiple-abort-signals-to-fetch-typescriptreact-33bb"><b>Blog Post</b></a> •
    <a href="https://github.com/rashidshamloo/fetch-multi-signal"><b>GitHub Repository</b></a>
</p>

<div align="center">

[![npm version](https://img.shields.io/npm/v/fetch-multi-signal.svg?style=flat-square)](https://www.npmjs.org/package/axios)
[![Build status](https://img.shields.io/github/actions/workflow/status/rashidshamloo/fetch-multi-signal/ci.yml?branch=main&label=CI&logo=github&style=flat-square)](https://github.com/rashidshamloo/fetch-multi-signal/actions/workflows/ci.yaml)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=fetch-multi-signal&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=fetch-multi-signal)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/fetch-multi-signal?style=flat-square)](https://bundlephobia.com/package/fetch-multi-signal@latest)
[![npm downloads](https://img.shields.io/npm/dm/fetch-multi-signal.svg?style=flat-square)](https://npm-stat.com/charts.html?package=fetch-multi-signal)
[![Known Vulnerabilities](https://snyk.io/test/npm/fetch-multi-signal/badge.svg)](https://snyk.io/test/npm/fetch-multi-signal)
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Browser Support](#browser-support)
- [Installation](#installation)
- [Usage](#usage)
  - [Using `async/await`](#using-asyncawait)
  - [Using `.then()`, `.catch()`, and `.finally()`](#using-then-catch-and-finally)
  - [Options](#options)
  - [TypeScript](#typescript)
  - [fetchMSAlt](#fetchmsalt)
- [Example](#example)
  - [Using with `useEffect()` hook in React](#using-with-useeffect-hook-in-react)
    - [Using the timeout option](#using-the-timeout-option)
    - [Using `AbortSignal.timeout()`](#using-abortsignaltimeout)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)
- [License](#license)

## Features

- Adds the `timeout` option to `fetch()`
- Accepts multiple AbortSignals and aborts if any of them are aborted.
- Works with both `AbortController().signal` and `AbortSignal.timeout()`
- Compatible with `fetch()` and can be used as a replacement in every call.

## Browser Support

![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png) | ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png) |
--- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |

## Installation

Using npm:

```bash
$ npm install fetch-multi-signal
```

Using yarn:

```bash
$ yarn add fetch-multi-signal
```

Once the package is installed, you can import the function:

```js
import { fetchMS } from 'fetch-multi-signal';
```

You can also use the default export:

```js
import fetchMS from 'fetch-multi-signal';
````

You can use `fetchMS()` as a drop-in replaement for `fetch()`:

```js
import { fetchMS as fetch } from 'fetch-multi-signal';
````

## Usage

### Using `async/await`

```js
const myFunction = async () => {
  try {
    const res = await fetchMS('url', options);
    const json = await res.json();
    console.log(json);
  } catch (err) {
    if (err.name === 'TimeoutError') console.error('Timeout Error');
    else if (err.name === 'AbortError') console.error('Abort Error');
  } finally {
    console.log('done');
  }
};
```

### Using `.then()`, `.catch()`, and `.finally()`

```js
fetchMS('url', options)
  .then((res) => res.json())
  .then((json) => console.log(json))
  .catch((err) => {
    if (err.name === 'TimeoutError') console.error('Timeout Error');
    else if (err.name === 'AbortError') console.error('Abort Error');
  })
  .finally(() => console.log('done'));
```

### Options

```js

// 2 sec timeout
fetchMS('url', { timeout: 2000 })

// 2 sec timeout with 2 AbortSignals
const controller1 = new AbortController();
const controller2 = new AbortController();
const signal1 = controller1.signal;
const signal2 = controller2.signal;

fetchMS('url', { timeout: 2000, signals: [signal1, signal2] })

// 2 sec timeout (using AbortSignal.timeout()) with 2 AbortSignals
const controller1 = new AbortController();
const controller2 = new AbortController();
const signal1 = controller1.signal;
const signal2 = controller2.signal;
const timeoutSignal = AbortSignal.timeout(2000);

fetchMS('url', { signal: timeoutSignal, signals: [signal1, signal2] })
// or fetchMS('url', { signal: signal1, signals: [timeoutSignal, signal2] })
```

> **_Note:_** You can use as many AbortSignals as you want in any order.

### TypeScript

```ts
import { fetchMS, RequestInitMS } from 'fetch-multi-signal';

const options: RequestInitMS = {
    timeout: 2000,
    signals: [signal1, signal2],
}

fetchMS('url', options)
// .then(... or await fetchMS(...
```

### fetchMSAlt

`fetchMSAlt()` works the same as `fetchMS()` but uses `setTimeout()` to implement the timeout option instead of `AbortSignal.timeout()`

```js
import { fetchMSAlt } from 'fetch-multi-signal';

fetchMSAlt('url', options)
```

## Example 

### Using with `useEffect()` hook in React

You can abort the fetch request using a timeout and in the clean-up function:

#### Using the timeout option

```js
useEffect(() => {
  const controller = new AbortController();

  fetchMS('url', { timeout: 2000, signal: controller.signal });
  //.then(...

  return () => controller.abort();
}, []);
```

#### Using `AbortSignal.timeout()`

```js
useEffect(() => {
  const controller = new AbortController();
  const timeoutSignal = AbortSignal.timeout(2000);

  fetchMS('url', { signals: [controller.signal, timeoutSignal] });
  //.then(...

  return () => controller.abort();
}, []);
```


## Troubleshooting

#### 1. `MaxListenersExceededWarning: Possible EventTarget memory leak detected. 11 abort listeners added to [AbortSignal].`
By default, Node.js has maximum listener limit of `10`. you can increase the limit depending on your use case:

```js
import events from 'events';

events.setMaxListeners(100);
``` 


## Credits

Inspired by: [Proposal: fetch with multiple AbortSignals](https://github.com/whatwg/fetch/issues/905)

## License

[MIT](LICENSE)
