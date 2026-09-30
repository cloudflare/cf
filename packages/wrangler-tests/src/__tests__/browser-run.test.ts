import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

describe("wrangler browser", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();

	beforeEach(() => {
		setIsTTY(true);
	});

	afterEach(() => {
		clearDialogs();
	});

	describe("list", () => {
		it.todo("should list active browser sessions", async ({ expect }) => {
			const sessions = [
				{
					sessionId: "session-1",
					startTime: 1234567890000,
					connectionId: "conn-1",
					connectionStartTime: 1234567880000,
				},
				{
					sessionId: "session-2",
					startTime: 1234567890000,
				},
			];
			msw.use(
				http.get(
					"*/accounts/:accountId/browser-rendering/devtools/session",
					() => {
						return HttpResponse.json(createFetchResult(sessions));
					},
					{ once: true }
				)
			);

			await runWrangler("browser-rendering devtools session list");
			expect(JSON.parse(std.out)).toEqual(sessions);
		});

		it.todo("should output JSON when --json flag is used", async ({
			expect,
		}) => {
			const sessions = [
				{
					sessionId: "session-1",
					startTime: 1234567890000,
				},
			];
			msw.use(
				http.get(
					"*/accounts/:accountId/browser-rendering/devtools/session",
					() => {
						return HttpResponse.json(createFetchResult(sessions));
					},
					{ once: true }
				)
			);

			await runWrangler("browser-rendering devtools session list");
			expect(JSON.parse(std.out)).toEqual(sessions);
		});

		it.todo("should output empty JSON array when --json flag is used with no sessions", async ({
			expect,
		}) => {
			msw.use(
				http.get(
					"*/accounts/:accountId/browser-rendering/devtools/session",
					() => {
						return HttpResponse.json(createFetchResult([]));
					},
					{ once: true }
				)
			);

			await runWrangler("browser-rendering devtools session list");
			expect(std.out).toMatchInlineSnapshot(`"[]"`);
		});
	});

	describe("view", () => {
		it.todo("should output JSON when --json flag is used with single target", async ({
			expect,
		}) => {
			const targets = [
				{
					id: "page-1",
					type: "page",
					title: "Test Page",
					url: "https://example.com",
					description: "",
					devtoolsFrontendUrl: "https://live.browser.run/ui/inspector?wss=abc",
					webSocketDebuggerUrl: "wss://live.browser.run/api/devtools/abc",
				},
			];
			msw.use(
				http.get(
					"*/accounts/:accountId/browser-rendering/devtools/browser/session-456/json",
					() => {
						return HttpResponse.json(createFetchResult(targets));
					},
					{ once: true }
				)
			);

			await runWrangler("browser-rendering devtools json get session-456");
			expect(JSON.parse(std.out)).toEqual(targets);
		});

		it.skip("should prefer page targets over other types", async () => {});
	});

	describe("create", () => {
		it.todo("should pass --lab flag to API", async ({ expect }) => {
			let labParam: string | null = null;
			msw.use(
				http.post(
					"*/accounts/:accountId/browser-rendering/devtools/browser",
					({ request }) => {
						const url = new URL(request.url);
						labParam = url.searchParams.get("lab");
						return HttpResponse.json(
							createFetchResult({
								sessionId: "lab-session-456",
								targets: [
									{
										id: "page-1",
										type: "page",
										title: "about:blank",
										url: "about:blank",
										description: "",
										devtoolsFrontendUrl:
											"https://live.browser.run/inspector/lab",
										webSocketDebuggerUrl: "wss://live.browser.run/lab",
									},
								],
							})
						);
					},
					{ once: true }
				)
			);

			await runWrangler("browser-rendering devtools browser create --lab");
			expect(labParam).toBe("true");
		});

		it.todo("should pass --keepAlive flag to API (converted to ms)", async ({
			expect,
		}) => {
			let keepAliveParam: string | null = null;
			msw.use(
				http.post(
					"*/accounts/:accountId/browser-rendering/devtools/browser",
					({ request }) => {
						const url = new URL(request.url);
						keepAliveParam = url.searchParams.get("keep_alive");
						return HttpResponse.json(
							createFetchResult({
								sessionId: "keepalive-session",
								targets: [
									{
										id: "page-1",
										type: "page",
										title: "about:blank",
										url: "about:blank",
										description: "",
										devtoolsFrontendUrl:
											"https://live.browser.run/inspector/ka",
										webSocketDebuggerUrl: "wss://live.browser.run/ka",
									},
								],
							})
						);
					},
					{ once: true }
				)
			);

			await runWrangler(
				"browser-rendering devtools browser create --keep-alive 300000"
			);
			expect(keepAliveParam).toBe("300000");
		});

		it.todo("should output JSON when --json flag is used", async ({
			expect,
		}) => {
			const response = {
				sessionId: "json-session-789",
				targets: [
					{
						id: "page-1",
						type: "page",
						title: "Test Page",
						url: "https://example.com",
						description: "",
						devtoolsFrontendUrl: "https://live.browser.run/inspector/json",
						webSocketDebuggerUrl: "wss://live.browser.run/json",
					},
				],
			};
			msw.use(
				http.post(
					"*/accounts/:accountId/browser-rendering/devtools/browser",
					() => {
						return HttpResponse.json(createFetchResult(response));
					},
					{ once: true }
				)
			);

			await runWrangler("browser-rendering devtools browser create");
			expect(JSON.parse(std.out)).toEqual(response);
		});

		it.skip("should prefer page targets over other types", async () => {});
	});

	describe("close", () => {
		it.todo("should close a session", async ({ expect }) => {
			msw.use(
				http.delete(
					"*/accounts/:accountId/browser-rendering/devtools/browser/session-to-close",
					() => {
						return HttpResponse.json(createFetchResult({ status: "closed" }));
					},
					{ once: true }
				)
			);

			await runWrangler(
				"browser-rendering devtools browser delete session-to-close --force"
			);
			expect(JSON.parse(std.out)).toEqual({ status: "closed" });
		});

		it.todo("should handle closing status", async ({ expect }) => {
			msw.use(
				http.delete(
					"*/accounts/:accountId/browser-rendering/devtools/browser/session-closing",
					() => {
						return HttpResponse.json(createFetchResult({ status: "closing" }));
					},
					{ once: true }
				)
			);

			await runWrangler(
				"browser-rendering devtools browser delete session-closing --force"
			);
			expect(JSON.parse(std.out)).toEqual({ status: "closing" });
		});

		it.todo("should output JSON when --json flag is used", async ({
			expect,
		}) => {
			msw.use(
				http.delete(
					"*/accounts/:accountId/browser-rendering/devtools/browser/session-json-close",
					() => {
						return HttpResponse.json(createFetchResult({ status: "closed" }));
					},
					{ once: true }
				)
			);

			await runWrangler(
				"browser-rendering devtools browser delete session-json-close --force"
			);
			expect(JSON.parse(std.out)).toEqual({ status: "closed" });
		});

		it.todo("should throw error when session not found", async ({ expect }) => {
			msw.use(
				http.delete(
					"*/accounts/:accountId/browser-rendering/devtools/browser/nonexistent",
					() => {
						return HttpResponse.json(
							{
								result: null,
								success: false,
								errors: [
									{
										code: 404,
										message: "Session not found",
									},
								],
							},
							{ status: 404 }
						);
					},
					{ once: true }
				)
			);

			await expect(
				runWrangler(
					"browser-rendering devtools browser delete nonexistent --force"
				)
			).rejects.toThrowError("API request failed with status 404");
		});
	});

	describe.skip("wrangler-only UX", () => {
		it.skip("should open DevTools for a session with single target (interactive)", async () => {});
		it.skip("should print URL only by default in non-interactive mode", async () => {});
		it.skip("should print URL only when --no-open is used", async () => {});
		it.skip("should prompt for selection when multiple page targets exist", async () => {});
		it.skip("should error when multiple targets exist and no --target specified (non-interactive)", async () => {});
		it.skip("should select target by exact id match", async () => {});
		it.skip("should select target by url substring match", async () => {});
		it.skip("should select target by title substring match (case-insensitive)", async () => {});
		it.skip("should output single matched target as JSON when --target and --json used", async () => {});
		it.skip("should throw error when --target matches no targets", async () => {});
		it.skip("should throw error when --target matches multiple targets", async () => {});
		it.skip("should throw error when no targets found", async () => {});
		it.skip("should error when no sessions exist", async () => {});
		it.skip("should auto-select when only one session exists (interactive)", async () => {});
		it.skip("should prompt for selection when multiple sessions exist (interactive)", async () => {});
		it.skip("should error when multiple sessions exist and no session ID provided (non-interactive)", async () => {});
		it.skip("should create a session and open DevTools (interactive)", async () => {});
		it.skip("should not open browser by default in non-interactive mode", async () => {});
		it.skip("should not open browser when --no-open is used", async () => {});
		it.skip("should validate --keepAlive is within range (60-600)", async () => {});
		it.skip("should throw error when no targets in response", async () => {});
		it.skip("should show message when no sessions found", async () => {});
	});
});
