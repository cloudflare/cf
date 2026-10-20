import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

describe("API command project config loading", () => {
	runInTempDir();
	setupMsw();

	afterEach(() => vi.restoreAllMocks());

	it("does not load project config when account ID and compliance region are in the environment", async () => {
		await writeFile(
			"cloudflare.config.ts",
			`import "a-package-that-does-not-exist"; export default {};`
		);
		vi.spyOn(console, "log").mockImplementation(() => undefined);
		let requested = false;
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/account-1/workers/scripts-search`,
				() => {
					requested = true;
					return HttpResponse.json({ success: true, result: [] });
				}
			)
		);

		const result = await runCf(
			["workers", "scripts", "search", "--name", "x"],
			{
				CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
				CLOUDFLARE_API_TOKEN: "test-token",
				CLOUDFLARE_ACCOUNT_ID: "account-1",
				CLOUDFLARE_COMPLIANCE_REGION: "public",
			}
		);

		expect(result.exitCode).toBe(0);
		expect(requested).toBe(true);
	});
});
