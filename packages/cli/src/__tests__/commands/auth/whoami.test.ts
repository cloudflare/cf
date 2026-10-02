import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { getGlobalDispatcher, MockAgent, setGlobalDispatcher } from "undici";
import { describe, expect, it } from "vite-plus/test";
import { server, setupMsw, TEST_BASE_URL } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

describe("cf auth whoami", () => {
	runInTempDir();
	setupMsw();
	const std = mockConsoleMethods();

	it("outputs the accounts the active credentials are authorised to use", async () => {
		server.use(
			http.get("*/user", () =>
				HttpResponse.json({
					success: true,
					result: { email: "user@example.com" },
				})
			)
		);

		const mockAgent = new MockAgent();
		mockAgent.disableNetConnect();
		const api = mockAgent.get("https://api.test");
		api
			.intercept({
				path: "/client/v4/accounts?page=1",
				method: "GET",
			})
			.reply(200, {
				success: true,
				result: [
					{ id: "account-1", name: "Account One", settings: {} },
					{ id: "account-2", name: "Account Two", settings: {} },
					{ id: "account-3", name: "Account Three", settings: {} },
				],
				result_info: { page: 1, total_pages: 1 },
			});
		api
			.intercept({
				path: "/client/v4/memberships?page=1",
				method: "GET",
			})
			.reply(200, {
				success: true,
				result: [
					{ account: { id: "account-1", name: "Account One" } },
					{ account: { id: "account-3", name: "Account Three" } },
				],
				result_info: { page: 1, total_pages: 1 },
			});
		const previousDispatcher = getGlobalDispatcher();
		setGlobalDispatcher(mockAgent);

		try {
			await runCf(["auth", "whoami"], {
				CLOUDFLARE_API_TOKEN: "test-token",
				CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			});
		} finally {
			setGlobalDispatcher(previousDispatcher);
			await mockAgent.close();
		}

		expect(JSON.parse(std.out)).toMatchObject({
			authenticated: true,
			tokenValid: true,
			email: "user@example.com",
			accounts: [
				{ id: "account-1", name: "Account One" },
				{ id: "account-3", name: "Account Three" },
			],
		});
	});
});
