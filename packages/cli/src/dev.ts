import { CliExit } from "./lib/cli-exit.js";
/**
 * Dev entry point. Invokes main() and maps CliExit → process.exit.
 * bin/cf does the same for the bundled build; this is the `pnpm dev`
 * equivalent when running via tsx directly.
 *
 * `main()` is the sole error-rendering site — it calls `handleError`
 * before rethrowing the original error so tests can catch it on the
 * `runMain` rejection and assert against the original shape.  Here we
 * only translate to a process exit code; we never write to stderr
 * ourselves.
 */
import { main } from "./index.js";

try {
	await main();
} catch (err) {
	if (err instanceof CliExit) {
		process.exit(err.code);
	}
	process.exit(1);
}
