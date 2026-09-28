/**
 * Progress indicator for in-flight API calls.
 *
 * Wraps clack's `spinner()` from `@clack/prompts`. Earlier iterations
 * rendered a free-floating braille spinner at column 0 via
 * `log-update`; clack's renderer gives us SIGINT cleanup, log-update
 * churn handling, and final ✓ / ✗ states for free with much less code.
 *
 *   │ ⠋  Creating secret on worker-ts (0.8s)
 *
 * Frames + elapsed-timer style preserved from cf's previous renderer
 * by passing braille frames + `indicator: "timer"` to clack. Silent
 * when stderr/stdout aren't TTYs and when `--quiet` / `CF_QUIET=1` is
 * set.
 *
 * Only wraps mutating requests (POST/PUT/PATCH/DELETE) so read-only
 * JSON output stays pristine for scripts piping to jq.
 */

import { spinner as clackSpinner } from "@clack/prompts";
import { VERSION } from "../version.js";
import { terminalProgress } from "./osc-progress.js";
import { openSession } from "./session.js";
import { supportsColor } from "./ui/theme.js";

/** Braille spinner frames (same set Claude Code uses). */
const BRAILLE_FRAMES = [
	"⠋",
	"⠙",
	"⠹",
	"⠸",
	"⠼",
	"⠴",
	"⠦",
	"⠧",
	"⠇",
	"⠏",
] as const;

/**
 * Should we render an animated spinner right now?
 *
 * False when:
 *   - stdout isn't a TTY (piping, CI, redirects)
 *   - colors are disabled (NO_COLOR, dumb terminal)
 *   - CF_QUIET is set (honored by higher-level output helpers)
 */
function canAnimate(): boolean {
	if (!supportsColor()) {
		return false;
	}
	if (!process.stdout.isTTY) {
		return false;
	}
	if (process.env.CF_QUIET === "1") {
		return false;
	}
	return true;
}

/**
 * Run `task()` with a live spinner and elapsed timer. Always resolves
 * with the task's return value. On error, stops the spinner, clears terminal
 * progress, and re-throws so the central error handler can render the failure.
 */
export async function withProgress<T>(
	message: string,
	task: () => Promise<T>
): Promise<T> {
	if (!canAnimate()) {
		return task();
	}

	// Defensive: make sure the clack session is open so the spinner's
	// `│ ` gutter has a `┌` (banner) anchor above it. `openSession`
	// is idempotent; calling it here covers cases where `main()`
	// short-circuited or a test reached `withProgress` directly.
	openSession(VERSION);

	// clack's spinner: braille frames + native timer indicator so we
	// keep cf's "Claude Code–style" feel while integrating with the
	// gutter. clack handles the log-update churn, SIGINT cleanup, and
	// final ✓ / ✗ state line for us — much less code than the
	// hand-rolled renderer this file used to ship.
	const s = clackSpinner({
		frames: [...BRAILLE_FRAMES],
		indicator: "timer",
		// 80ms per frame — same cadence as the previous renderer.
		delay: 80,
	});

	terminalProgress.setIndeterminate();
	s.start(message);
	try {
		const result = await task();
		terminalProgress.clear();
		s.stop(message);
		return result;
	} catch (err) {
		terminalProgress.clear();
		// `error()` writes a red ✗ + message line, closing the
		// spinner's gutter row cleanly so subsequent error-block
		// rendering attaches to a known-good state.
		s.error(message);
		throw err;
	}
}
