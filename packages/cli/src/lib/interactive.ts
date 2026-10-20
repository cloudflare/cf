import ci from "ci-info";

/**
 * Returns whether the process should not prompt the user.
 *
 * Prompts read stdin and render on stderr, so both must be terminals, and
 * nothing prompts in CI (detected via `ci-info`). stdout does not matter:
 * `cf kv namespaces create > ns.json` can still ask for the title.
 *
 * Use this for anything that should be suppressed or adapted in CI:
 * - User prompts (confirmations, text input, select dialogs)
 * - OAuth login flows
 * - Banner / decoration display
 * - Writing config changes back to disk
 *
 * This is currently the only interactivity helper cf exposes; add an
 * `isInteractive()` wrapper only when a caller actually needs the
 * strict-TTY-only flavour (hotkeys, spinners, typed-name confirmation).
 */
export function isNonInteractiveOrCI(): boolean {
	try {
		return !(process.stdin.isTTY && process.stderr.isTTY) || ci.isCI;
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
