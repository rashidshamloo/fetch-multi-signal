"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMSAlt = exports.fetchMS = void 0;
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
const fetchMS = (input, initMS) => __awaiter(void 0, void 0, void 0, function* () {
    // if no options are provided, do regular fetch
    if (!initMS)
        return yield fetch(input);
    let { timeout, signals } = initMS, init = __rest(initMS, ["timeout", "signals"]);
    // if no timeout or signals is provided, do regular fetch with options
    if (!timeout && !signals)
        return yield fetch(input, init);
    signals || (signals = []);
    // if signal is empty and signals only has one item,
    // set signal to it and do regular fetch
    if (signals.length === 1 && !init.signal)
        return yield fetch(input, Object.assign(Object.assign({}, init), { signal: signals[0] }));
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
        signals[i].addEventListener('abort', () => {
            controller.abort(signals[i].reason);
        }, { signal: controller.signal });
    }
    return yield fetch(input, Object.assign(Object.assign({}, init), { signal: controller.signal }));
});
exports.fetchMS = fetchMS;
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
const fetchMSAlt = (input, initMS) => __awaiter(void 0, void 0, void 0, function* () {
    // if no options are provided, do regular fetch
    if (!initMS)
        return yield fetch(input);
    let { timeout, signals } = initMS, init = __rest(initMS, ["timeout", "signals"]);
    // if no timeout or signals is provided, do regular fetch with options
    if (!timeout && !signals)
        return yield fetch(input, init);
    signals || (signals = []);
    // if signal is empty and signals only has one item,
    // set signal to it and do regular fetch
    if (signals.length === 1 && !init.signal)
        return yield fetch(input, Object.assign(Object.assign({}, init), { signal: signals[0] }));
    // if signal is set, push to signals array
    init.signal && signals.push(init.signal);
    const controller = new AbortController();
    // timeout setup
    let timeoutId;
    if (timeout) {
        const reason = new DOMException(`signal timed out (${timeout}ms)`, 'TimeoutError');
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
        signals[i].addEventListener('abort', () => {
            controller.abort(signals[i].reason);
            timeout && clearTimeout(timeoutId);
        }, { signal: controller.signal });
    }
    let res;
    try {
        res = yield fetch(input, Object.assign(Object.assign({}, init), { signal: controller.signal }));
    }
    finally {
        timeout && clearTimeout(timeoutId);
    }
    return res;
});
exports.fetchMSAlt = fetchMSAlt;
exports.default = exports.fetchMS;
