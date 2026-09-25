import { vi } from "vite-plus/test";

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
