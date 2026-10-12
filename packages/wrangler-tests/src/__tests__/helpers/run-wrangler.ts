import { normalizeString } from "@cloudflare/workers-utils/test-helpers";
import { CliExit, runMain } from "cf";
import { parse as parseShell } from "shell-quote";
import { vi } from "vite-plus/test";

/**
 * 'Run' a command for tests — except routes through `cf` instead of
 * wrangler. Each invocation:
 *
 *   1. Parses the command string into argv (shell-quote handles quoting).
 *   2. Dispatches into cf's `runMain(argv)`.
 *   3. Swallows the success-side `CliExit(0)` so callers don't see it.
 *
 * Test bodies must use cf paths directly (e.g. `kv namespaces create`,
 * not wrangler's `kv namespace create`). The function name stays
 * `runWrangler` only because the imported test corpus uses that name.
 */
export async function runWrangler(
	cmd = "",
	env: Record<string, string | undefined> = {}
) {
	for (const [key, value] of Object.entries(env)) {
		vi.stubEnv(key, value);
	}
	try {
		const argv = parseShell(cmd).filter(
			(t): t is string => typeof t === "string"
		);
		await runMain(argv);
	} catch (err) {
		if (err instanceof CliExit && err.code === 0) {
			return;
		}
		if (err instanceof Error) {
			err.message = normalizeString(err.message);
		}
		throw err;
	}
}
