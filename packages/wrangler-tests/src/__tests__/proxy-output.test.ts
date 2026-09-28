import { beforeEach, describe, it, vi } from "vitest";
import { mockConsoleMethods } from "./helpers/mock-console";
import { runWrangler } from "./helpers/run-wrangler";

describe("proxy startup output", () => {
	const std = mockConsoleMethods();

	beforeEach(() => {
		vi.resetModules();
	});

	it("keeps JSON output parseable when a proxy is configured", async ({
		expect,
	}) => {
		await runWrangler("schema --list", {
			HTTPS_PROXY: "http://127.0.0.1:8080",
		});

		// cf does not emit a proxy-detection warning on stdout;
		// JSON output should remain parseable.
		const parsed = JSON.parse(std.out);
		expect(Array.isArray(parsed)).toBe(true);
	});

	it.skip("wrangler-only: HTTPS_PROXY detection warning on startup", () => {
		// cf does not currently emit a proxy-detection warning —
		// proxy support flows through the SDK / undici defaults without a
		// startup banner.
	});
});
