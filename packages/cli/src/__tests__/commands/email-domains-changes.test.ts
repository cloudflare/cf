import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * `cf email-domains changes` must not drop the response envelope's
 * top-level `platform` data, which the API documents as required: it is
 * the current shared gate that callers must combine with each domain's
 * state change. Stdout must stay the bare `result` payload so scripts
 * piping through `jq` keep working, mirroring how #478 exposes
 * `result_info` on stderr.
 */
describe("email-domains changes platform metadata (network)", () => {
	runInTempDir();
	setupMsw();
	const output = mockOutputStreams();
	const env = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	};
	const changesUrl = `${TEST_BASE_URL}/accounts/test-account/email/domain-changes`;

	it("exposes required platform data while keeping stdout JSON unchanged", async () => {
		const changes = [
			{ domain: "example.com", state: "pending_verification" },
			{ domain: "gone.example.com", state: "removed" },
		];
		const platform = { gate: "shared", revision: 7 };
		const resultInfo = { has_more: false, next_cursor: null };
		server.use(
			http.get(changesUrl, () =>
				HttpResponse.json({
					success: true,
					result: changes,
					result_info: resultInfo,
					platform,
				})
			)
		);

		expect(await runCf(["email-domains", "changes"], env)).toEqual({
			exitCode: 0,
		});

		// stdout stays exactly the result payload for scripts.
		expect(JSON.parse(output.out)).toEqual(changes);

		// The required platform metadata is exposed to callers, not dropped.
		const platformLine = output.err
			.split("\n")
			.find((entry) => entry.startsWith("platform: "));
		expect(platformLine).toBeDefined();
		expect(JSON.parse(platformLine?.slice("platform: ".length) ?? "")).toEqual(
			platform
		);

		// result_info metadata keeps flowing as before.
		const resultInfoLine = output.err
			.split("\n")
			.find((entry) => entry.startsWith("result_info: "));
		expect(JSON.parse(resultInfoLine?.slice("result_info: ".length) ?? "")).toEqual(
			resultInfo
		);
	});
});
