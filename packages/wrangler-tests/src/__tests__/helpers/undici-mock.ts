// The compiled cf test bundle keeps undici external. Route its fetch calls
// through the current global implementation so MSW can intercept them, while
// preserving Undici's remaining exports for code and tests that use them.
export * from "../../../node_modules/undici/index.js";

export const fetch: typeof globalThis.fetch = (...args) =>
	globalThis.fetch(...args);
export const FormData = globalThis.FormData;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
