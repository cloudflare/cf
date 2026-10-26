/**
 * Messages for people.
 *
 * stdout carries only a command's output (JSON or a raw payload), so every
 * message goes to stderr: clack log lines for notices, warnings and flows,
 * and commands for the user to run next. `--quiet` hides notices but never
 * warnings. The `✓` success line is `printSuccess` in `../output.ts`.
 *
 * Not re-exported from `./index.ts`: the entry point imports that barrel, and
 * loading clack there would slow every invocation.
 */

import * as clack from "@clack/prompts";
import { hasQuietFlag } from "../args.js";
import { theme } from "./theme.js";
import type { LogMessageOptions } from "@clack/prompts";

/** clack prefixes message lines with a glyph and two spaces (`│  `). */
export const GUIDE_WIDTH = 3;

function toStderr(options?: LogMessageOptions): LogMessageOptions {
	return { output: process.stderr, spacing: 0, ...options };
}

/** clack log lines on stderr, without a spacer line above. */
export const log = {
	/** A notice, then any commands it suggests. `--quiet` hides both. */
	info: (message: string, ...commands: string[]) => {
		if (hasQuietFlag()) {
			return;
		}
		clack.log.info(message, toStderr());
		printCommands(commands);
	},
	/** A warning, then any commands that fix it. */
	warn: (message: string, ...commands: string[]) => {
		clack.log.warn(message, toStderr());
		printCommands(commands);
	},
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
function printCommands(commands: string[]): void {
	if (commands.length === 0) {
		return;
	}
	const indent = " ".repeat(GUIDE_WIDTH);
	process.stderr.write(
		`\n${commands.map((command) => indent + theme.code(command)).join("\n")}\n\n`
	);
}
