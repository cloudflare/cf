import { getCloudflareContainerRegistry } from "@cloudflare/containers-shared";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_AGENT } from "../../version.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

vi.mock("../../lib/agent-context.js", () => ({
	detectAgentContext: () => ({
		isAgentic: true,
		harness: { id: "codex", name: "OpenAI Codex" },
		model: null,
		sessionId: null,
		invocationId: null,
		matches: [],
	}),
}));

const registry = `https://${getCloudflareContainerRegistry()}`;
describe("cf containers images", () => {
	runInTempDir();
	setupMsw();
	const std = mockConsoleMethods();
	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "account");
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", TEST_BASE_URL);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
	});
	function credentials(permissions = ["pull"]) {
		const calls: string[] = [];
		server.use(
			http.post(
				`${TEST_BASE_URL}/accounts/account/containers/registries/:domain/credentials`,
				async ({ request }) => {
					expect(request.headers.get("user-agent")).toBe(USER_AGENT);
					expect(request.headers.get("x-cf-cli-mode")).toMatch(
						/^(interactive|non-interactive|ci)$/
					);
					expect(request.headers.get("x-cf-cli-agent")).toBe("codex");
					expect(request.headers.get("authorization")).toBe(
						"Bearer test-api-token"
					);
					expect(await request.json()).toEqual({
						expiration_minutes: 5,
						permissions,
					});
					calls.push("credentials");
					return HttpResponse.json({
						success: true,
						result: { password: "registry-secret" },
					});
				}
			)
		);
		return calls;
	}
	function deletion(gcStatus = 202) {
		const calls = credentials(["pull", "push"]);
		const url = `${registry}/v2/account/app/manifests/v1`;
		server.use(
			http.head(url, ({ request }) => {
				expect(request.headers.get("authorization")).toBe(
					`Basic ${Buffer.from("v1:registry-secret").toString("base64")}`
				);
				calls.push("head");
				return new HttpResponse(null, {
					headers: { "Docker-Content-Digest": "sha256:abc" },
				});
			}),
			http.delete(url, () => {
				calls.push("delete");
				return new HttpResponse(null, { status: 202 });
			}),
			http.put(`${registry}/v2/gc/layers`, () => {
				calls.push("gc");
				return new HttpResponse(null, { status: gcStatus });
			})
		);
		return calls;
	}
	it("prints filtered repository tags as JSON", async () => {
		credentials();
		server.use(
			http.get(`${registry}/v2/_catalog`, ({ request }) => {
				expect(new URL(request.url).searchParams.get("tags")).toBe("true");
				return HttpResponse.json({
					repositories: {
						"account/app": ["v1", "sha256:abc", "sha256-deadbeef"],
						"account/other": ["v2"],
					},
				});
			})
		);
		await runCf(["containers", "images", "list", "--filter", "app$"]);
		expect(JSON.parse(std.out)).toEqual([
			{ name: "app", tags: ["v1", "sha256-deadbeef"] },
		]);
	});
	it("deletes a tag with --force and returns its digest", async () => {
		const calls = deletion();
		await runCf(["containers", "images", "delete", "app:v1", "--force"]);
		expect(calls).toEqual(["credentials", "head", "delete", "gc"]);
		expect(JSON.parse(std.out)).toEqual({
			image: "app:v1",
			digest: "sha256:abc",
		});
	});
	it("does not request credentials or delete without confirmation in non-interactive mode", async () => {
		const calls = deletion();
		await runCf(["containers", "images", "delete", "app:v1"]);
		expect(calls).toEqual([]);
	});
	it("honors --quiet without bypassing --force", async () => {
		const calls = deletion();
		await runCf(["containers", "images", "delete", "app:v1", "--quiet"]);
		expect(calls).toEqual([]);
		await runCf([
			"containers",
			"images",
			"delete",
			"app:v1",
			"--quiet",
			"--force",
		]);
		expect(calls).toEqual(["credentials", "head", "delete", "gc"]);
		expect(std.out).toBe("");
	});
	for (const quiet of [false, true]) {
		it(`reports successful deletion and a GC warning with quiet=${quiet}`, async () => {
			const calls = deletion(500);
			await runCf([
				"containers",
				"images",
				"delete",
				"app:v1",
				"--force",
				...(quiet ? ["--quiet"] : []),
			]);
			expect(calls).toEqual(["credentials", "head", "delete", "gc"]);
			expect(std.warn).toContain(
				"was deleted, but the garbage-collection request failed: 500"
			);
			if (quiet) {
				expect(std.out).toBe("");
			} else {
				expect(JSON.parse(std.out)).toEqual({
					image: "app:v1",
					digest: "sha256:abc",
					warning: expect.stringContaining("garbage-collection request failed"),
				});
			}
		});
	}
	it("lists all pages while merging tags for the same repository", async () => {
		credentials();
		const cursors: (string | null)[] = [];
		server.use(
			http.get(`${registry}/v2/_catalog`, ({ request }) => {
				const cursor = new URL(request.url).searchParams.get("last");
				cursors.push(cursor);
				return cursor === null
					? HttpResponse.json(
							{ repositories: { "account/app": ["v1"] } },
							{
								headers: {
									Link: `${registry}/v2/_catalog?tags=true&last=next; rel=next`,
								},
							}
						)
					: HttpResponse.json({ repositories: { "account/app": ["v2"] } });
			})
		);
		await runCf(["containers", "images", "list"]);
		expect(cursors).toEqual([null, "next"]);
		expect(JSON.parse(std.out)).toEqual([{ name: "app", tags: ["v1", "v2"] }]);
	});
	it("validates before contacting the registry", async () => {
		await expect(
			runCf(["containers", "images", "delete", "app", "--force"])
		).rejects.toThrow("Expected IMAGE:TAG");
		await expect(
			runCf(["containers", "images", "list", "--filter", "["])
		).rejects.toThrow();
	});
	it.each(["list", "delete"])("rejects --local for %s", async (command) => {
		await expect(
			runCf([
				"containers",
				"images",
				command,
				...(command === "delete" ? ["app:v1"] : []),
				"--local",
			])
		).rejects.toThrow("--local is not supported");
	});
	it("retains prepare alongside the new commands in unauthenticated help", async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		await runCf(["containers", "images", "--help"]);
		for (const command of ["prepare", "list", "delete"]) {
			expect(std.out).toContain(`images ${command}`);
		}
	});
});
