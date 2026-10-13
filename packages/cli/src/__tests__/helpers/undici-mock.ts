// Keep Undici's API while routing fetch through the implementation MSW intercepts.
export * from "../../../node_modules/undici/index.js";

export const fetch: typeof globalThis.fetch = (...args) =>
	globalThis.fetch(...args);
export const FormData = globalThis.FormData;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
