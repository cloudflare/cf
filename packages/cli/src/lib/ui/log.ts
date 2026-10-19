/**
 * Messages for people.
 *
 * stdout carries only a command's output (JSON or a raw payload), so every
 * message goes to stderr: clack log lines for notices and warnings, the `✓`
 * success line, and commands for the user to run next.
 */

import * as clack from "@clack/prompts";
import { theme } from "./theme.js";
import type { LogMessageOptions } from "@clack/prompts";

/** clack prefixes message lines with a glyph and two spaces (`│  `). */
export const GUIDE_WIDTH = 3;

function toStderr(options?: LogMessageOptions): LogMessageOptions {
	return { output: process.stderr, spacing: 0, ...options };
}

/** clack log lines on stderr, without a spacer line above by default. */
export const log = {
	info: (message: string, options?: LogMessageOptions) =>
		clack.log.info(message, toStderr(options)),
	warn: (message: string, options?: LogMessageOptions) =>
		clack.log.warn(message, toStderr(options)),
};

/**
 * The `✓` line confirming that a command finished. It prints only when
 * stderr is a terminal; scripts read the exit code instead.
 */
export function printSuccess(message: string): void {
	if (process.stderr.isTTY) {
		process.stderr.write(`${theme.success("✓")} ${message}\n`);
	}
}

/**
 * Commands for the user to run next, each on its own line. They are indented
 * to the guide's text column without its glyphs, so copying one from the
 * terminal yields exactly the command.
 */
export function printCommands(...commands: string[]): void {
	const indent = " ".repeat(GUIDE_WIDTH);
	process.stderr.write(
		`\n${commands.map((command) => indent + theme.code(command)).join("\n")}\n\n`
	);
}
