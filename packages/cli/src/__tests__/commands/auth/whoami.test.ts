import { writeAuthConfigFile } from "@cloudflare/workers-auth/cf";
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

	async function runWithAccountResponses(
		accountResponse: { status: number; body: object },
		membershipResponse: { status: number; body: object },
		env: Record<string, string | undefined> = {}
	): Promise<Record<string, unknown>> {
		const mockAgent = new MockAgent();
		mockAgent.disableNetConnect();
		const api = mockAgent.get("https://api.test");
		api
			.intercept({ path: "/client/v4/accounts?page=1", method: "GET" })
			.reply(accountResponse.status, accountResponse.body);
		api
			.intercept({ path: "/client/v4/memberships?page=1", method: "GET" })
			.reply(membershipResponse.status, membershipResponse.body);
		const previousDispatcher = getGlobalDispatcher();
		setGlobalDispatcher(mockAgent);

		try {
			await runCf(["auth", "whoami"], {
				CLOUDFLARE_API_TOKEN: "test-token",
				CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
				...env,
			});
			return JSON.parse(std.getAndClearOut()) as Record<string, unknown>;
		} finally {
			setGlobalDispatcher(previousDispatcher);
			await mockAgent.close();
		}
	}

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

	it("recognizes a scoped token when user and account details are forbidden", async () => {
		server.use(
			http.get("*/user/tokens/verify", () =>
				HttpResponse.json({ success: true, result: { status: "active" } })
			),
			http.get("*/user", () =>
				HttpResponse.json(
					{ success: false, errors: [{ code: 9109, message: "Forbidden" }] },
					{ status: 403 }
				)
			)
		);
		const forbidden = {
			status: 403,
			body: { success: false, errors: [{ code: 9109, message: "Forbidden" }] },
		};

		const output = await runWithAccountResponses(forbidden, forbidden);

		expect(output).toMatchObject({
			authenticated: true,
			tokenValid: true,
			accounts: [],
		});
		expect(output).not.toHaveProperty("email");
	});

	it("does not call a disabled token valid when detail lookups succeed", async () => {
		server.use(
			http.get("*/user/tokens/verify", () =>
				HttpResponse.json({ success: true, result: { status: "disabled" } })
			),
			http.get("*/user", () =>
				HttpResponse.json({
					success: true,
					result: { email: "user@example.com" },
				})
			)
		);
		const empty = {
			status: 200,
			body: {
				success: true,
				result: [],
				result_info: { page: 1, total_pages: 1 },
			},
		};

		const output = await runWithAccountResponses(empty, empty);

		expect(output.tokenValid).toBe(false);
	});

	it("accepts an account token when the user-token endpoint rejects it", async () => {
		server.use(
			http.get("*/user/tokens/verify", () =>
				HttpResponse.json(
					{
						success: false,
						errors: [{ code: 1000, message: "Invalid API Token" }],
					},
					{ status: 403 }
				)
			),
			http.get("*/user", () =>
				HttpResponse.json(
					{ success: false, errors: [{ code: 9109, message: "Forbidden" }] },
					{ status: 403 }
				)
			)
		);
		const accountResponse = {
			status: 200,
			body: {
				success: true,
				result: [{ id: "account-1", name: "Account One", settings: {} }],
				result_info: { page: 1, total_pages: 1 },
			},
		};
		const membershipResponse = {
			status: 403,
			body: {
				success: false,
				errors: [{ code: 9106, message: "Authentication failed" }],
			},
		};

		const output = await runWithAccountResponses(
			accountResponse,
			membershipResponse
		);

		expect(output).toMatchObject({
			tokenValid: true,
			accounts: [{ id: "account-1", name: "Account One" }],
		});
	});

	it("reports unknown validity when every check is inconclusive", async () => {
		server.use(
			http.get("*/user/tokens/verify", () =>
				HttpResponse.json({ success: false }, { status: 503 })
			),
			http.get("*/user", () =>
				HttpResponse.json({ success: false }, { status: 403 })
			)
		);
		const forbidden = { status: 403, body: { success: false } };

		const output = await runWithAccountResponses(forbidden, forbidden);

		expect(output.tokenValid).toBeNull();
	});

	it("uses detail lookups for OAuth without calling user-token verification", async () => {
		writeAuthConfigFile({
			oauth_token: "oauth-token",
			expiration_time: "2999-01-01T00:00:00.000Z",
		});
		let verificationRequests = 0;
		server.use(
			http.get("*/user/tokens/verify", () => {
				verificationRequests++;
				return HttpResponse.json({
					success: true,
					result: { status: "active" },
				});
			}),
			http.get("*/user", () =>
				HttpResponse.json({
					success: true,
					result: { email: "user@example.com" },
				})
			)
		);
		const empty = {
			status: 200,
			body: {
				success: true,
				result: [],
				result_info: { page: 1, total_pages: 1 },
			},
		};

		const output = await runWithAccountResponses(empty, empty, {
			CLOUDFLARE_API_TOKEN: undefined,
		});

		expect(output.tokenValid).toBe(true);
		expect(verificationRequests).toBe(0);
	});
});
