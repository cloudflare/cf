import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

interface CloudflareTunnel {
	id: string;
	name: string;
	status: string;
	created_at: string;
	tun_type: string;
	account_tag: string;
}

const defaultTunnel: CloudflareTunnel = {
	id: "f70ff985-a4ef-4643-bbbc-4a0ed4fc8415",
	name: "my-tunnel",
	status: "healthy",
	created_at: "2024-01-15T10:30:00Z",
	tun_type: "cfd_tunnel",
	account_tag: "some-account-id",
};

const secondTunnel: CloudflareTunnel = {
	id: "550e8400-e29b-41d4-a716-446655440000",
	name: "api-tunnel",
	status: "inactive",
	created_at: "2024-01-10T15:45:00Z",
	tun_type: "cfd_tunnel",
	account_tag: "some-account-id",
};

// The API-backed help and CRUD commands have direct cf equivalents.
// Wrangler's cloudflared process management remains outside cf.
describe("tunnel help", () => {
	const std = mockConsoleMethods();
	runInTempDir();

	it("should show help text when no arguments are passed", async ({
		expect,
	}) => {
		await runWrangler("tunnels");

		expect(std.out).toContain("cf tunnels");
		expect(std.out).toContain("create");
		expect(std.out).toContain("delete");
		expect(std.out).toContain("get");
		expect(std.out).toContain("list");
	});

	it("should show help when an invalid argument is passed", async ({
		expect,
	}) => {
		await expect(runWrangler("tunnels invalid")).rejects.toThrow(
			/Unknown command: invalid/
		);
		expect(std.err).toContain("Unknown command: invalid");
	});
});

describe("tunnel commands", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	const std = mockConsoleMethods();

	beforeEach(() => {
		setIsTTY(true);
	});

	afterEach(() => {
		clearDialogs();
	});

	describe("tunnel create", () => {
		it("should create a tunnel", async ({ expect }) => {
			const request = mockTunnelCreate();

			await runWrangler(
				"tunnels create --name my-new-tunnel --config-src cloudflare"
			);

			await expect(request).resolves.toEqual({
				name: "my-new-tunnel",
				config_src: "cloudflare",
			});
			expect(JSON.parse(std.out)).toMatchObject({
				id: defaultTunnel.id,
				name: "my-new-tunnel",
			});
		});

		it("should require a tunnel name", async ({ expect }) => {
			setIsTTY(false);
			await expect(
				runWrangler("tunnels create --config-src cloudflare")
			).rejects.toThrow("--name is required");
		});
	});

	describe("tunnel list", () => {
		it("should list all tunnels", async ({ expect }) => {
			mockTunnelList([defaultTunnel, secondTunnel]);

			await runWrangler("tunnels list");

			expect(JSON.parse(std.out)).toEqual([defaultTunnel, secondTunnel]);
		});

		// cf deliberately returns an empty JSON list instead of Wrangler's
		// product-specific "No tunnels found." prose.
		it.skip("should show message when no tunnels exist");
	});

	describe("tunnel info", () => {
		it("should get tunnel details", async ({ expect }) => {
			mockTunnelGet(defaultTunnel);

			await runWrangler(`tunnels get ${defaultTunnel.id}`);

			expect(JSON.parse(std.out)).toEqual(defaultTunnel);
		});

		it("should require a tunnel ID", async ({ expect }) => {
			await expect(() => runWrangler("tunnels get")).rejects.toThrow(
				"Not enough non-option arguments"
			);
		});

		it("should handle non-existent tunnel", async ({ expect }) => {
			const tunnelId = "f70ff985-a4ef-4643-bbbc-4a0ed4fc0000";
			mockTunnelGetNotFound(tunnelId);

			await expect(runWrangler(`tunnels get ${tunnelId}`)).rejects.toThrow(
				"Tunnel not found"
			);
		});
	});

	describe("tunnel delete", () => {
		it("should delete tunnel with confirmation", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes a Cloudflare Tunnel. Continue?",
				result: true,
			});
			const requests = mockTunnelDelete(defaultTunnel.id);

			await runWrangler(`tunnels delete ${defaultTunnel.id}`);

			expect(requests.count).toBe(1);
		});

		it("should cancel deletion when not confirmed", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes a Cloudflare Tunnel. Continue?",
				result: false,
			});
			const requests = mockTunnelDelete(defaultTunnel.id);

			await runWrangler(`tunnels delete ${defaultTunnel.id}`);

			expect(requests.count).toBe(0);
		});

		it("should skip confirmation with --force", async ({ expect }) => {
			const requests = mockTunnelDelete(defaultTunnel.id);

			await runWrangler(`tunnels delete ${defaultTunnel.id} --force`);

			expect(requests.count).toBe(1);
		});

		it("should require a tunnel ID", async ({ expect }) => {
			await expect(() => runWrangler("tunnels delete")).rejects.toThrow(
				"Not enough non-option arguments"
			);
		});
	});

	describe("tunnel quick-start", () => {
		it.skip("should spawn cloudflared with correct args for quick tunnel");
		it.skip("should require a URL argument");
	});

	describe("tunnel run", () => {
		it.skip("should pass token via TUNNEL_TOKEN env var, not CLI args");
		it.skip("should require tunnel or token");
	});
});

describe("tunnel permission errors", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();

	it("should show helpful error message when permission is denied", async ({
		expect,
	}) => {
		mockTunnelPermissionError();

		await expect(runWrangler("tunnels list")).rejects.toThrow(
			/403|permission|Authentication error/i
		);
		expect(std.err).toContain("Authentication error");
		expect(std.err).toContain("Check your API token permissions");
	});
});

function mockTunnelCreate(): Promise<{
	name: string;
	config_src: string;
}> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/:accountId/cfd_tunnel",
				async ({ request, params }) => {
					const body = (await request.json()) as {
						name: string;
						config_src: string;
					};
					expect(params.accountId).toBe("some-account-id");
					resolve(body);

					return HttpResponse.json(
						createFetchResult({
							...defaultTunnel,
							name: body.name,
						})
					);
				},
				{ once: true }
			)
		);
	});
}

function mockTunnelList(tunnels: CloudflareTunnel[]) {
	msw.use(
		http.get("*/accounts/:accountId/tunnels", ({ request, params }) => {
			expect(params.accountId).toBe("some-account-id");
			const url = new URL(request.url);
			const page = Number(url.searchParams.get("page") || 1);
			const perPage = Number(url.searchParams.get("per_page") || 20);
			const result = page === 1 ? tunnels : [];

			return HttpResponse.json(
				createFetchResult(result, true, [], [], {
					page,
					per_page: perPage,
					count: result.length,
					total_count: tunnels.length,
				})
			);
		})
	);
}

function mockTunnelGet(tunnel: CloudflareTunnel) {
	msw.use(
		http.get(
			"*/accounts/:accountId/cfd_tunnel/:tunnelId",
			({ params }) => {
				expect(params.accountId).toBe("some-account-id");
				expect(params.tunnelId).toBe(tunnel.id);
				return HttpResponse.json(createFetchResult(tunnel));
			},
			{ once: true }
		)
	);
}

function mockTunnelGetNotFound(tunnelId: string) {
	msw.use(
		http.get(
			`*/accounts/:accountId/cfd_tunnel/${tunnelId}`,
			() =>
				HttpResponse.json(
					createFetchResult(null, false, [
						{ code: 10000, message: "Tunnel not found" },
					]),
					{ status: 404 }
				),
			{ once: true }
		)
	);
}

function mockTunnelDelete(tunnelId: string) {
	const requests = { count: 0 };
	msw.use(
		http.delete(
			`*/accounts/:accountId/cfd_tunnel/${tunnelId}`,
			({ params }) => {
				expect(params.accountId).toBe("some-account-id");
				requests.count++;
				return HttpResponse.json(createFetchResult(null));
			},
			{ once: true }
		)
	);
	return requests;
}

function mockTunnelPermissionError() {
	msw.use(
		http.get(
			"*/accounts/:accountId/tunnels",
			() =>
				HttpResponse.json(
					createFetchResult(null, false, [
						{ code: 10000, message: "Authentication error" },
					]),
					{ status: 403 }
				),
			{ once: true }
		)
	);
}
