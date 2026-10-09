/**
 * Blocks module — left-gutter message rendering for errors.
 *
 * Each block is a self-contained frame using clack-style rounded
 * corners:
 *
 *   ┌ Title
 *   │ message
 *   │ message continued
 *   │
 *   │ details
 *   └
 *
 * The corners match clack's `shapes.corners.{tl,bl}` so the visual
 * language is shared with clack's own prompts.
 *
 * Earlier iterations tried `╷`/`╵` (half-height caps — visible gaps)
 * and `╭`/`╰` (rounded corners — clashed with the cf banner), plus a
 * two-mode "standalone vs. in-session" split that tracked whether
 * `clack.intro()` had opened a shared gutter. The in-session mode
 * produced an ugly bare `┌` corner above the emoji banner, so the
 * intro was dropped and blocks unconditionally render their own frame.
 *
 * Previously also shipped `warningBlock` / `successBlock` / `infoBlock`
 * / `brandBlock`. None had callers; `errorBlock` is the only block in
 * use today.
 *
 * Design goals:
 *
 *   - No `boxen` dependency — pure string assembly.
 *   - ANSI-safe word-wrap (coloring applied per-line after wrap, so
 *     wraps never split a mid-line color span).
 *   - Plain output reads fine in non-color terminals (chalk's
 *     `level = 0` knob strips styling; Unicode box-drawing glyphs
 *     render in every modern terminal).
 */

import { theme } from "./theme.js";

interface ErrorBlockOptions {
	/** Optional title rendered on the first line. Defaults to "Error". */
	title?: string;
	/**
	 * If true, skip per-line coloring of `message` and pass the
	 * caller's already-styled string through verbatim. Useful when the
	 * caller wants to emphasize parts (bold codes, dim subordinated
	 * subtitles, …).
	 */
	rawMessage?: boolean;
}

/**
 * Gutter glyphs. `bar` is the body-line prefix; `top` / `bottom`
 * match clack's `shapes.corners.{tl,bl}` so cf blocks read in the
 * same visual language as clack's own prompts.
 */
const GUTTER = {
	bar: "│",
	top: "┌",
	bottom: "└",
} as const;

/**
 * Render an error message in a left-gutter frame.
 *
 * @param message - Error message (rendered bold + error color per-line)
 * @param details - Optional secondary content rendered dim under the
 *   message, separated by a blank gutter line.
 * @param opts.title - Optional title override (defaults to "Error").
 * @param opts.rawMessage - If true, skip per-line coloring and pass
 *   the caller's already-styled `message` through verbatim.
 * @returns Formatted block string (no trailing newline).
 */
export function errorBlock(
	message: string,
	details?: string,
	opts?: ErrorBlockOptions
): string {
	const title = opts?.title ?? "Error";
	const bar = theme.error(GUTTER.bar);
	const topCorner = theme.error(GUTTER.top);
	const bottomCorner = theme.error(GUTTER.bottom);

	// Content area is (terminal width) - (gutter "│ " = 2 cols). Floor
	// at 20 cols so very narrow terminals still produce readable lines.
	const innerWidth = Math.max(20, (process.stdout.columns || 80) - 2);

	const lines: string[] = [];

	// Breathing room above the block — blank line above the `┌`
	// corner so the block doesn't crowd whatever rendered before.
	lines.push("");

	// First line: top corner + bold title.
	lines.push(`${topCorner} ${theme.error(theme.bold(title))}`);

	// Message lines, color-per-line (or raw if requested).
	if (opts?.rawMessage) {
		// Caller-styled — pass through, but still split on newlines so
		// each rendered row gets its own gutter prefix.
		for (const line of message.split("\n")) {
			lines.push(line.length > 0 ? `${bar} ${line}` : bar);
		}
	} else {
		for (const line of wrapPlain(message, innerWidth)) {
			lines.push(
				line.length > 0 ? `${bar} ${theme.error(theme.bold(line))}` : bar
			);
		}
	}

	// Details (optional) — dim, separated from message by a blank
	// gutter line so the eye can distinguish primary from secondary.
	if (details) {
		lines.push(bar);
		for (const line of wrapPlain(details, innerWidth)) {
			lines.push(line.length > 0 ? `${bar} ${theme.muted(line)}` : bar);
		}
	}

	lines.push(bottomCorner);

	return lines.join("\n");
}

/**
 * Word-wrap a plain (un-colored) string to `width` columns. Preserves
 * explicit newlines in the source.
 */
export function wrapPlain(text: string, width: number): string[] {
	const out: string[] = [];
	for (const para of text.split("\n")) {
		if (para.length <= width) {
			out.push(para);
			continue;
		}
		const words = para.split(/\s+/);
		let line = "";
		for (const word of words) {
			if (!line) {
				line = word;
				continue;
			}
			if (line.length + 1 + word.length <= width) {
				line += " " + word;
			} else {
				out.push(line);
				line = word;
			}
		}
		if (line) {
			out.push(line);
		}
	}
	return out;
}
