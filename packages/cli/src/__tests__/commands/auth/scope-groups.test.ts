import { DefaultScopeKeys } from "@cloudflare/workers-auth/cf";
import { describe, expect, it } from "vite-plus/test";
import {
	formatScopeGroups,
	formatScopeSummary,
	groupScopes,
} from "../../../commands/auth/scope-groups.js";

describe("scope groups", () => {
	it("assigns every default scope to a product area", () => {
		const other = groupScopes(DefaultScopeKeys)
			.get("Other")
			?.map((e) => e.resource);
		expect(new Set(other)).toEqual(new Set(["artifacts", "resource-sharing"]));
	});

	it("follows Cloudflare's split between scope spellings", () => {
		const groups = groupScopes([
			"ai.read",
			"ai:read",
			"page.shield",
			"page.read",
		]);

		expect(groups.get("AI & Machine Learning")?.map((e) => e.scope)).toEqual([
			"ai.read",
		]);
		expect(groups.get("Developer Platform")?.map((e) => e.scope)).toEqual([
			"ai:read",
			"page.read",
		]);
		expect(groups.get("App Security")?.map((e) => e.scope)).toEqual([
			"page.shield",
		]);
	});

	it("merges both scope spellings and skips scopes without an action", () => {
		const groups = groupScopes([
			"openid",
			"offline_access",
			"workers_kv:write",
			"workers-kv-storage.read",
			"access-app.revoke",
		]);

		expect([...groups.keys()]).toEqual([
			"Developer Platform",
			"Cloudflare One / Zero Trust",
		]);
		expect(groups.get("Developer Platform")?.map((e) => e.resource)).toEqual([
			"workers-kv",
			"workers-kv-storage",
		]);
	});

	it("narrows by product name and by scope name", () => {
		const scopes = ["d1:write", "queues.read", "dns.read"];

		expect(formatScopeGroups(scopes, { product: "developer" })).not.toContain(
			"DNS"
		);
		expect(formatScopeGroups(scopes, { filter: "d1" })).not.toContain("queues");
		expect(formatScopeGroups(scopes, { product: "dns", filter: "d1" })).toBe(
			""
		);
	});

	it("matches products from the start of a word", () => {
		const scopes = ["ai.read", "email-sending.write", "ssl-certs.write"];

		expect(formatScopeGroups(scopes, { product: "ai" })).not.toContain("Email");
		expect(formatScopeGroups(scopes, { product: "perf" })).toContain(
			"Cache & Performance"
		);
	});

	it("shows granted and default counts and marks custom scopes", () => {
		expect(
			formatScopeGroups(["d1:write", "d1.read", "hyperdrive-planetscale:setup"])
		).toMatchInlineSnapshot(`
			"Developer Platform (2/122 + 1 custom)
			  d1                      read, write
			  hyperdrive-planetscale  setup (custom)"
		`);
	});

	it("matches products by resource name as well as area", () => {
		const scopes = ["workers-scripts.write", "d1.read", "dns.read"];

		const workers = formatScopeGroups(scopes, { product: "workers" });
		expect(workers).toContain("workers-scripts");
		expect(workers).not.toContain("d1");
		expect(workers).not.toContain("DNS");
		expect(formatScopeGroups(scopes, { product: "d1" })).toContain("d1");
	});

	it("filters on the displayed spelling of a scope", () => {
		const scopes = ["workers_kv:write", "workers-kv-storage.read"];

		const shown = formatScopeGroups(scopes, { filter: "workers-kv" });
		expect(shown).toMatch(/workers-kv +write/);
		expect(shown).toMatch(/workers-kv-storage +read/);
		expect(formatScopeGroups(scopes, { filter: "workers_kv" })).toMatch(
			/workers-kv-storage +read/
		);
	});

	it("counts custom scopes apart from defaults", () => {
		const summary = formatScopeSummary([
			"d1.read",
			"hyperdrive-planetscale:setup",
			"artifacts-custom.read",
		]);

		expect(summary).toMatch(/Developer Platform +1\/\d+ \+ 1 custom/);
		expect(summary).not.toMatch(/2\/\d+/);
	});

	it("summarizes nothing when no scope grants product access", () => {
		expect(formatScopeSummary([])).toBe("");
		expect(formatScopeSummary(["openid", "offline_access"])).toBe("");
	});
});
