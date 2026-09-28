import { isInteractive } from "@cloudflare/cli-shared-helpers/interactive";
import ci from "ci-info";

/**
 * Returns whether the process should not prompt the user.
 *
 * Returns `true` when the process is non-interactive (no TTY) **or** running
 * in any CI environment (detected via `ci-info`).
 *
 * Use this for anything that should be suppressed or adapted in CI:
 * - User prompts (confirmations, text input, select dialogs)
 * - OAuth login flows
 * - Output format decisions (JSON in CI, pretty when interactive)
 * - Banner / decoration display
 * - Writing config changes back to disk
 *
 * This is currently the only interactivity helper cf exposes; add an
 * `isInteractive()` wrapper only when a caller actually needs the
 * strict-TTY-only flavour (hotkeys, spinners, typed-name confirmation).
 */
export function isNonInteractiveOrCI(): boolean {
	return !isInteractive() || ci.isCI;
}

/**
 * Raw CI flag. Exposed for telemetry-style decisions that want to distinguish
 * "running in CI" from "no TTY" — e.g. the `X-CF-CLI-Mode` header which
 * reports `ci` vs `non-interactive` vs `interactive` as distinct states.
 *
 * For gating prompts / OAuth / banners, prefer {@link isNonInteractiveOrCI}.
 */
export const isCI = ci.isCI;
