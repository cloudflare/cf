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
 * by passing braille frames + `indicator: "timer"` to clack. It draws on
 * stderr, and only when stdin and stderr are terminals outside CI and
 * `CF_QUIET=1` is unset, so stdout stays clean for scripts piping to jq.
 */

import { spinner as clackSpinner } from "@clack/prompts";
import { VERSION } from "../version.js";
import { isNonInteractiveOrCI } from "./interactive.js";
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
 *   - stdin or stderr isn't a TTY, or we're in CI. clack's spinner reads
 *     stdin as keypresses, so it would swallow input piped into cf.
 *   - colors are disabled (NO_COLOR, dumb terminal)
 *   - CF_QUIET is set (honored by higher-level output helpers)
 */
function canAnimate(): boolean {
	if (!supportsColor(process.env, process.stderr.isTTY === true)) {
		return false;
	}
	if (isNonInteractiveOrCI()) {
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
		output: process.stderr,
	});

	terminalProgress.setIndeterminate();
	s.start(message);
	// clack's spinner swallows SIGINT and SIGTERM, and reads a terminal's
	// Ctrl+C or Esc as a cancel keypress that exits 0. Exit as an interrupted
	// process would, so a pipeline or `&&` chain stops.
	const interrupted = (signal: NodeJS.Signals) =>
		process.exit(signal === "SIGTERM" ? 143 : 130);
	const exiting = (code: number) => {
		if (code === 0) {
			process.exitCode = 130;
		}
	};
	process.on("SIGINT", interrupted);
	process.on("SIGTERM", interrupted);
	process.on("exit", exiting);
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
	} finally {
		process.off("SIGINT", interrupted);
		process.off("SIGTERM", interrupted);
		process.off("exit", exiting);
	}
}
