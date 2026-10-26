import { format } from "node:util";
import { normalizeString } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, vi } from "vite-plus/test";

/**
 * Capture a command's output streams.
 *
 * Command tests assert on stdout (JSON payloads, help text) and stderr
 * (spinners, `✓` lines, warnings) constantly; every one of them was
 * hand-rolling the same three spies. Call in `beforeEach` and read the
 * accessors afterwards — `vi.restoreAllMocks()` (or vitest's
 * `restoreMocks`) undoes the spies.
 */
export function captureOutput(): {
	stdout: () => string;
	stderr: () => string;
	clear: () => void;
} {
	const log = vi.spyOn(console, "log").mockImplementation(() => {});
	const err = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	const joined = (spy: typeof log, separator: string) =>
		spy.mock.calls.map((call: unknown[]) => String(call[0])).join(separator);
	return {
		stdout: () => joined(log, "\n"),
		stderr: () => joined(err as unknown as typeof log, ""),
		clear: () => {
			log.mockClear();
			err.mockClear();
		},
	};
}

/**
 * Capture everything written to each stream, like `mockConsoleMethods`.
 *
 * Console calls and direct stream writes (clack lines, `✓` success lines,
 * raw payloads) share one buffer per stream, so a test can assert that
 * stdout holds only the command's output. Call at `describe` level; output
 * is normalized the same way as `mockConsoleMethods`.
 *
 * stderr is not a terminal unless a test calls `setStderrTTY(true)`, so
 * terminal-only output does not depend on how the suite was launched.
 */
export function mockOutputStreams(): {
	readonly out: string;
	readonly err: string;
	getAndClearOut: () => string;
	getAndClearErr: () => string;
	setStderrTTY: (isTTY: boolean) => void;
} {
	let out = "";
	let err = "";
	let spies: { mockRestore: () => void }[] = [];
	let originalStderrTTY: PropertyDescriptor | undefined;
	const setStderrTTY = (isTTY: boolean) => {
		Object.defineProperty(process.stderr, "isTTY", {
			configurable: true,
			value: isTTY,
		});
	};
	const toOut = (...args: unknown[]) => {
		out += `${format(...args)}\n`;
	};
	const toErr = (...args: unknown[]) => {
		err += `${format(...args)}\n`;
	};

	beforeEach(() => {
		out = "";
		err = "";
		originalStderrTTY = Object.getOwnPropertyDescriptor(
			process.stderr,
			"isTTY"
		);
		setStderrTTY(false);
		spies = [
			vi.spyOn(console, "log").mockImplementation(toOut),
			vi.spyOn(console, "info").mockImplementation(toOut),
			vi.spyOn(console, "debug").mockImplementation(toOut),
			vi.spyOn(console, "warn").mockImplementation(toErr),
			vi.spyOn(console, "error").mockImplementation(toErr),
			vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
				out += String(chunk);
				return true;
			}),
			vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
				err += String(chunk);
				return true;
			}),
		];
	});
	afterEach(() => {
		for (const spy of spies) {
			spy.mockRestore();
		}
		if (originalStderrTTY) {
			Object.defineProperty(process.stderr, "isTTY", originalStderrTTY);
		} else {
			Reflect.deleteProperty(process.stderr, "isTTY");
		}
	});

	const read = (buffer: string) => normalizeString(buffer).replace(/\n+$/, "");
	return {
		get out() {
			return read(out);
		},
		get err() {
			return read(err);
		},
		getAndClearOut: () => {
			const value = read(out);
			out = "";
			return value;
		},
		getAndClearErr: () => {
			const value = read(err);
			err = "";
			return value;
		},
		setStderrTTY,
	};
}
