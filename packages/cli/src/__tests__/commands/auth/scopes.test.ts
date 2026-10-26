import { writeAuthConfigFile } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

const catalogue = [
	{ id: "d1.read", name: "D1 Read", category: "developer_platform" },
	{ id: "queues.read", name: "Queues Read", category: "developer_platform" },
	{ id: "dns.read", name: "DNS Read", category: "dns_and_zones" },
];

const env = { CLOUDFLARE_API_BASE_URL: TEST_BASE_URL };

function writeScopes(scopes?: string[], profile?: string): void {
	writeAuthConfigFile(
		{
			oauth_token: "oauth-token",
			refresh_token: "refresh-token",
			expiration_time: new Date(Date.now() + 3_600_000).toISOString(),
			...(scopes && { scopes }),
		},
		profile
	);
}

describe("cf auth scopes", () => {
	runInTempDir();
	setupMsw();
	const std = mockOutputStreams();
	let catalogueRequests = 0;

	beforeEach(() => {
		catalogueRequests = 0;
		writeScopes(["openid", "d1:write", "d1.read", "queues.read", "dns.read"]);
		server.use(
			http.get(`${TEST_BASE_URL}/oauth/scopes`, () => {
				catalogueRequests++;
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: catalogue,
				});
			})
		);
	});

	it("summarizes granted scopes by catalogue category", async () => {
		await runCf(["auth", "scopes"], env);

		expect(std.out).toMatch(/Developer Platform +2\/\d+/);
		expect(std.out).toMatch(/DNS & Zones +1\/\d+/);
		expect(std.out).toMatch(/Uncategorized +1\/\d+/);
		expect(std.err).toContain("cf auth scopes <product>");
		expect(std.out).not.toContain("d1");
	});

	it("reuses the cached catalogue", async () => {
		await runCf(["auth", "scopes"], env);
		await runCf(["auth", "scopes", "--all"], env);

		expect(catalogueRequests).toBe(1);
	});

	it("shows one product's permissions, narrowed by --filter", async () => {
		await runCf(["auth", "scopes", "developer", "--filter", "d1"], env);

		expect(std.out).toMatch(/d1 +read/);
		expect(std.out).not.toContain("queues");
		expect(std.out).not.toContain("DNS");
		expect(std.out).not.toContain("write");
	});

	it("shows every product's permissions with --all", async () => {
		await runCf(["auth", "scopes", "--all"], env);

		expect(std.out).toMatch(/Developer Platform[^\n]*\n {2}d1 +read/);
		expect(std.out).toMatch(/dns +read/);
		expect(std.out).toMatch(/Uncategorized[^\n]*\n {2}d1 +write/);
	});

	it("lists scopes ungrouped when the catalogue can't be loaded", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/oauth/scopes`, () =>
				HttpResponse.json(
					{ success: false, errors: [{ code: 10000, message: "boom" }] },
					{ status: 500 }
				)
			)
		);

		await runCf(["auth", "scopes"], env);

		expect(std.err).toContain("Couldn't load Cloudflare's scope catalogue");
		expect(std.out.split("\n")).toEqual([
			"openid",
			"d1:write",
			"d1.read",
			"queues.read",
			"dns.read",
		]);
	});

	it("explains that an API token has no OAuth scopes", async () => {
		await runCf(["auth", "scopes"], { CLOUDFLARE_API_TOKEN: "test-token" });

		expect(std.err).toContain("CLOUDFLARE_API_TOKEN is set");
	});

	it("says when no product scopes are granted", async () => {
		writeScopes(["openid", "offline_access"]);

		await runCf(["auth", "scopes"], env);

		expect(std.out).toBe("");
		expect(std.err).toContain("No product scopes granted.");
		expect(std.err).not.toContain("cf auth scopes <product>");
		expect(catalogueRequests).toBe(0);
	});

	it("points at --filter when no product area matches", async () => {
		await runCf(["auth", "scopes", "d1"], env);

		expect(std.out).toBe("");
		expect(std.err).toContain('No product area matches "d1".');
		expect(std.err).toContain("cf auth scopes --filter d1");
	});

	it("keeps the catalogue when an entry is malformed", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/oauth/scopes`, () =>
				HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: [
						...catalogue,
						{ id: "openid", name: "OpenID", category: null },
						{ name: "No id" },
					],
				})
			)
		);

		await runCf(["auth", "scopes"], env);

		expect(std.err).not.toContain("Couldn't load");
		expect(std.out).toMatch(/Developer Platform +2\/\d+/);
	});

	it("explains that the CF_API_TOKEN alias has no OAuth scopes", async () => {
		await runCf(["auth", "scopes"], { CF_API_TOKEN: "test-token" });

		expect(std.out).toBe("");
		expect(std.err).toContain("CLOUDFLARE_API_TOKEN is set");
		expect(catalogueRequests).toBe(0);
	});

	it("rejects --temporary-account", async () => {
		await expect(
			runCf(["auth", "scopes", "--temporary-account"], env)
		).rejects.toThrow("--temporary-account and --event-code are not supported");
		expect(catalogueRequests).toBe(0);
	});

	it("says when a login didn't record its scopes", async () => {
		writeScopes();

		await runCf(["auth", "scopes"], env);

		expect(std.err).not.toContain("Not logged in");
		expect(std.err).toContain("This login didn't record its scopes.");
	});

	it("points a named profile at cf auth create", async () => {
		writeScopes(["openid"], "work");

		await runCf(["auth", "scopes", "--profile", "work"], env);

		expect(std.err).toContain("cf auth create work");
		expect(std.err).not.toContain("cf auth login");
	});

	it("suggests logging in again when the catalogue fetch is rejected", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/oauth/scopes`, () =>
				HttpResponse.json(
					{ success: false, errors: [{ code: 10000, message: "denied" }] },
					{ status: 401 }
				)
			)
		);

		await runCf(["auth", "scopes"], env);

		expect(std.err).toContain("your login was rejected");
		expect(std.err).toContain("cf auth login --force");
		expect(std.err).not.toContain("CLOUDFLARE_API_TOKEN");
	});
});
