/**
 * OSC 9;4 terminal progress support.
 *
 * Supported terminals render this outside the main terminal buffer, usually in
 * the tab title area or OS taskbar. The sequence is ignored here unless stderr
 * is a TTY and the terminal is known to support it, so JSON stdout remains
 * machine-readable.
 */
import { hasQuietFlag } from "./args.js";

export const OscProgressState = {
	Hidden: 0,
	Normal: 1,
	Error: 2,
	Indeterminate: 3,
	Warning: 4,
} as const;

export type OscProgressState =
	(typeof OscProgressState)[keyof typeof OscProgressState];

class OscProgressController {
	private cleanupRegistered = false;

	get isDisabled(): boolean {
		return (
			process.env.CF_NO_OSC_PROGRESS === "1" ||
			process.env.CF_QUIET === "1" ||
			hasQuietFlag()
		);
	}

	get isSupported(): boolean {
		if (this.isDisabled) {
			return false;
		}

		if (!process.stderr.isTTY) {
			return false;
		}

		if (process.env.CF_FORCE_OSC_PROGRESS === "1") {
			return true;
		}

		const termProgram = process.env.TERM_PROGRAM?.toLowerCase() ?? "";
		if (
			termProgram.includes("ghostty") ||
			termProgram.includes("iterm") ||
			termProgram.includes("wezterm")
		) {
			return true;
		}

		if (process.env.WT_SESSION) {
			return true;
		}

		if (process.env.ConEmuANSI === "ON") {
			return true;
		}

		return false;
	}

	setIndeterminate(): void {
		if (!this.isSupported) {
			return;
		}

		this.ensureCleanup();
		this.write(OscProgressState.Indeterminate);
	}

	clear(): void {
		if (!this.isSupported) {
			return;
		}

		process.stderr.write(`\x1b]9;4;${OscProgressState.Hidden};0\x07`);
	}

	ensureCleanup(): void {
		if (this.cleanupRegistered) {
			return;
		}

		this.cleanupRegistered = true;

		const cleanup = (): void => {
			this.clear();
		};

		process.on("exit", cleanup);
	}

	private write(state: OscProgressState): void {
		if (!this.isSupported) {
			return;
		}

		process.stderr.write(`\x1b]9;4;${state};0\x07`);
	}
}

export const terminalProgress = new OscProgressController();
