import ci from "ci-info";

/**
 * Returns whether the process should not prompt the user or decorate
 * `output`.
 *
 * Someone must be at the keyboard and watching `output`, so stdin and
 * `output` must both be terminals, and nothing is interactive in CI (detected
 * via `ci-info`). Prompts render on stderr, the default, so
 * `cf kv namespaces create > ns.json` can still ask for the title. JSON goes
 * to stdout, so its highlighting passes `process.stdout`.
 *
 * Use this for anything that should be suppressed or adapted in CI:
 * - User prompts (confirmations, text input, select dialogs)
 * - OAuth login flows
 * - Output format decisions (JSON in CI, pretty when interactive)
 * - Banner / spinner / decoration display
 * - Writing config changes back to disk
 *
 * This is currently the only interactivity helper cf exposes; add an
 * `isInteractive()` wrapper only when a caller actually needs the
 * strict-TTY-only flavour (hotkeys, typed-name confirmation).
 */
export function isNonInteractiveOrCI(
	output: NodeJS.WriteStream = process.stderr
): boolean {
	try {
		return !(process.stdin.isTTY && output.isTTY) || ci.isCI;
	} catch {
		// Reading `process.stdin` throws when Node can't open its terminal.
		return true;
	}
}

/**
 * Raw CI flag. Exposed for telemetry-style decisions that want to distinguish
 * "running in CI" from "no TTY" — e.g. the `X-CF-CLI-Mode` header which
 * reports `ci` vs `non-interactive` vs `interactive` as distinct states.
 *
 * For gating prompts / OAuth / banners, prefer {@link isNonInteractiveOrCI}.
 */
export const isCI = ci.isCI;
