import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

describe("Bot Management cleanup flags", () => {
	runInTempDir();
	setupMsw();
	afterEach(() => vi.restoreAllMocks());

	it("previews and sends the documented SBFM Pro cleanup payload", async () => {
		const output = captureOutput();
		const env = {
			CI: "true",
			CF_SEND_TELEMETRY: "false",
			CLOUDFLARE_API_TOKEN: "test-token",
			CLOUDFLARE_ACCOUNT_ID: "test-account",
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		};
		const args = [
			"bot-management",
			"update",
			"--zone",
			"00000000000000000000000000000000",
			"--sbfm-likely-automated",
			"allow",
			"--fight-mode",
			"false",
		];
		const expected = { sbfm_likely_automated: "allow", fight_mode: false };
		await runCf([...args, "--dry-run"], env);
		expect(JSON.parse(output.stdout())).toMatchObject({ body: expected });

		const bodies: unknown[] = [];
		server.use(
			http.put(
				`${TEST_BASE_URL}/zones/00000000000000000000000000000000/bot_management`,
				async ({ request }) => {
					bodies.push(await request.json());
					return HttpResponse.json({ success: true, result: null });
				}
			)
		);
		await runCf(args, env);
		expect(bodies).toEqual([expected]);
	});
});
