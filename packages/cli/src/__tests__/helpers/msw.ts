import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vite-plus/test";
import type { RequestHandler } from "msw";

/**
 * Shared MSW (Mock Service Worker) harness for the cf CLI package.
 *
 * cf's generated SDK issues every request via
 * `globalThis.fetch` (see its `client.js`: `this._fetch = options.fetch
 * ?? globalThis.fetch`). MSW's Node server intercepts global fetch.
 * The test-only Undici alias routes workers-auth's imported fetch through
 * it too, so account lookups and OAuth calls use the same handlers.
 * Replacing Undici's global dispatcher after `server.listen()` would
 * disable MSW's fetch interception.
 *
 * Tests point the SDK at a stable test origin by setting
 * `CLOUDFLARE_API_BASE_URL` (honoured by `createCommandClient` in
 * `lib/auth.ts`) and register handlers for that origin. The default
 * `onUnhandledFrame: "error"` turns any un-mocked outbound request
 * into a loud failure rather than a silent real network call — a unit
 * suite must never reach the real Cloudflare API.
 */

/** Base origin tests route the SDK at via `CLOUDFLARE_API_BASE_URL`. */
export const TEST_BASE_URL = "https://api.test/client/v4";

/**
 * The shared MSW server. Created with no default handlers; each test
 * (or `describe`) registers what it needs via `server.use(...)`.
 */
export const server = setupServer();

/** Alias used by deploy tests. */
export const msw = server;

/**
 * Wire the MSW server lifecycle into the current test file.
 *
 * Call once at the top of a `describe` (or module scope). Starts the
 * interceptor before the suite, resets handlers between tests (so one
 * test's `server.use` can't leak into the next), and closes it after.
 *
 * @param handlers - Optional always-on handlers installed for every
 *   test in the file (per-test overrides still layer on via
 *   `server.use`).
 */
export function setupMsw(...handlers: RequestHandler[]): void {
	beforeAll(() => {
		server.listen({ onUnhandledFrame: "error" });
		if (handlers.length > 0) {
			server.use(...handlers);
		}
	});
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());
}

export function createFetchResult(
	result: unknown,
	success = true,
	errors: { code: number; message: string }[] = [],
	messages: string[] = []
) {
	return { result, success, errors, messages };
}
