/**
 * Messages for people.
 *
 * stdout carries only a command's output (JSON or a raw payload), so every
 * message goes to stderr: clack log lines for notices and warnings, and
 * commands for the user to run next. The `✓` success line is `printSuccess`
 * in `../output.ts`.
 *
 * Not re-exported from `./index.ts`: the entry point imports that barrel, and
 * loading clack there would slow every invocation.
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
	success: (message: string) => clack.log.success(message, toStderr()),
	error: (message: string) => clack.log.error(message, toStderr()),
	message: (message: string) => clack.log.message(message, toStderr()),
	/** A bold `├` heading that starts a stage of a flow, such as Build. */
	section: (title: string) =>
		clack.log.message(
			theme.bold(title),
			toStderr({ symbol: theme.muted("├") })
		),
	/** `└` closes the flow above it. */
	end: (message: string) => clack.outro(message, { output: process.stderr }),
};

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
