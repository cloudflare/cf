import { log } from "@clack/prompts";
import { afterEach, beforeEach, vi } from "vite-plus/test";

/**
 * The clack mock drops log lines. Record the ones cf sends to stderr through
 * console.error, so a test can assert them on `std.err`.
 *
 * Call at `describe` level, after `mockConsoleMethods()`.
 */
export function mockClackStderrLog(): void {
	let spies: { mockRestore: () => void }[] = [];

	beforeEach(() => {
		spies = (["info", "warn"] as const).map((method) =>
			vi.spyOn(log, method).mockImplementation((message, options) => {
				if (options?.output === process.stderr) {
					console.error(message);
				}
			})
		);
	});
	afterEach(() => {
		for (const spy of spies) {
			spy.mockRestore();
		}
	});
}
