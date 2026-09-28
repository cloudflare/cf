/**
 * Banner emission for cf.
 *
 * cf prints a slim `🍊☁️  cf · v…` headline once at the top of every
 * interactive invocation. This module owns the once-per-process latch
 * so every call site (main(), handleError, withProgress, prompt
 * helpers) can defensively call `openSession` without worrying about
 * duplicate output.
 *
 * Previously this module managed a `clack.intro()` / `clack.outro()`
 * session that strung the banner, prompts, spinner, and error blocks
 * into one continuous `┌ … │ … └` gutter. The intro rendered an ugly
 * bare `┌` glyph above the emoji headline, so the session model was
 * dropped and each piece now owns its own framing.
 *
 * Stream choice: the banner writes to **stderr** so JSON output on
 * stdout stays pristine for `jq` and similar consumers.
 */

import { getAuthFromEnv } from "@cloudflare/workers-auth";
import { renderPromptIntro } from "./ui/banner.js";
import { theme } from "./ui/theme.js";
import type { UpdateNotice } from "./update-check.js";

/** Whether the banner has been printed this process. */
let bannerPrinted = false;

/**
 * Whether banner emission is suppressed for this process. Set on the
 * first call when `--quiet` / non-TTY apply so subsequent calls
 * remain no-ops.
 */
let bannerSuppressed = false;

/** Whether the active profile has been printed this process. */
let activeProfilePrinted = false;

/**
 * Print the cf banner once per process. Idempotent — safe to call
 * from any number of entry points.
 *
 * Suppressed (no-op) when:
 *   - `opts.quiet` is true (caller passed `--quiet` / `-q`)
 *   - stderr isn't a TTY (CI, pipes, redirects)
 */
export function openSession(
	version: string,
	opts: { quiet?: boolean; update?: UpdateNotice } = {}
): void {
	if (bannerPrinted || bannerSuppressed) {
		return;
	}
	if (opts.quiet || !process.stderr.isTTY) {
		bannerSuppressed = true;
		return;
	}
	process.stderr.write(`${renderPromptIntro(version, opts.update)}\n`);
	bannerPrinted = true;
}

/** Print an applicable non-default profile directly below the banner. */
export function printActiveProfileLine(profile: string): void {
	if (
		!bannerPrinted ||
		bannerSuppressed ||
		activeProfilePrinted ||
		profile === "default" ||
		getAuthFromEnv({ allowGlobalAuthKey: false }) !== undefined
	) {
		return;
	}

	process.stderr.write(
		`${theme.muted("Active profile:")} ${theme.info(profile)}\n`
	);
	activeProfilePrinted = true;
}
