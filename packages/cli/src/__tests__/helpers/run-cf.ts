import { vi } from "vite-plus/test";
import { runMain } from "../../index.js";
import { CliExit } from "../../lib/cli-exit.js";

/**
 * Run cf in-process for tests.
 *
 * Takes argv as an explicit array (no shell-quote parsing) and dispatches
 * into `runMain(argv)`. Swallows `CliExit(0)` so a successful early-exit
 * (`--help`, splash) doesn't bubble up as a test failure.
 *
 * Non-zero `CliExit` codes are returned as `{ exitCode }` so tests can
 * assert against them without try/catch noise. Real errors (parse
 * failures, handler throws that aren't `CliExit`) propagate.
 *
 * `env` lets a test stub specific env vars for the duration of the call.
 * Vitest's `unstubEnvs: true` (in `vitest.config.mts`) auto-restores
 * after each test so callers don't need to clean up.
 */
export async function runCf(
	argv: string[] = [],
	env: Record<string, string | undefined> = {}
): Promise<{ exitCode: number }> {
	for (const [key, value] of Object.entries(env)) {
		vi.stubEnv(key, value);
	}
	try {
		await runMain(argv);
		return { exitCode: 0 };
	} catch (err) {
		if (err instanceof CliExit) {
			return { exitCode: err.code };
		}
		throw err;
	}
}
