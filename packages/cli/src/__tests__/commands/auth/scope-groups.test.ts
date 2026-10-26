import { DefaultScopeKeys } from "@cloudflare/workers-auth/cf";
import { describe, expect, it } from "vite-plus/test";
import {
	formatScopeGroups,
	formatScopeSummary,
	groupScopes,
	hasProductScopes,
} from "../../../commands/auth/scope-groups.js";
import type {
	CatalogueScope,
	ScopeCatalogue,
} from "../../../commands/auth/scope-catalogue.js";

const scopes: CatalogueScope[] = [
	{ id: "d1.read", name: "D1 Read", category: "developer_platform" },
	{ id: "d1.write", name: "D1 Write", category: "developer_platform" },
	{
		id: "workers-scripts.write",
		name: "Workers Scripts Write",
		category: "developer_platform",
	},
	{
		id: "workers-kv-storage.read",
		name: "Workers KV Storage Read",
		category: "developer_platform",
	},
	{ id: "queues.read", name: "Queues Read", category: "developer_platform" },
	{
		id: "custom-tool.run",
		name: "Custom Tool Run",
		category: "developer_platform",
	},
	{ id: "dns.read", name: "DNS Read", category: "dns_and_zones" },
	{ id: "ai.read", name: "AI Read", category: "ai_and_machine_learning" },
	{
		id: "email-sending.write",
		name: "Email Sending Write",
		category: "email_and_messaging",
	},
	{
		id: "ssl-and-certificates.write",
		name: "SSL and Certificates Write",
		category: "cache_and_performance",
	},
	{ id: "artifacts.read", name: "Artifacts Read", category: "other" },
	{
		id: "new-thing.read",
		name: "New Thing Read",
		category: "brand_new_and_shiny",
	},
	{ id: "nameless.read", name: "Nameless Read" },
];
const catalogue: ScopeCatalogue = new Map(scopes.map((s) => [s.id, s]));

describe("scope groups", () => {
	it("groups scopes by their catalogue category", () => {
		const groups = groupScopes(["d1.read", "dns.read", "ai.read"], catalogue);

		expect(
			Object.fromEntries(
				[...groups].map(([area, entries]) => [
					area,
					entries.map((e) => e.scope),
				])
			)
		).toEqual({
			"Developer Platform": ["d1.read"],
			"DNS & Zones": ["dns.read"],
			"AI & Machine Learning": ["ai.read"],
		});
	});

	it("puts scopes the catalogue doesn't categorize under Uncategorized", () => {
		const groups = groupScopes(
			["d1:write", "workers_kv:write", "nameless.read"],
			catalogue
		);

		expect([...groups.keys()]).toEqual(["Uncategorized"]);
		expect(groups.get("Uncategorized")?.map((e) => e.resource)).toEqual([
			"d1",
			"workers_kv",
			"nameless",
		]);
	});

	it("title-cases a category it has no heading for", () => {
		expect([...groupScopes(["new-thing.read"], catalogue).keys()]).toEqual([
			"Brand New & Shiny",
		]);
	});

	it("skips scopes without an action", () => {
		expect(hasProductScopes(["openid", "offline_access"])).toBe(false);
		expect(hasProductScopes(["openid", "d1.read"])).toBe(true);
		expect(groupScopes(["openid", "offline_access"], catalogue).size).toBe(0);
	});

	it("lists areas alphabetically with Other and Uncategorized last", () => {
		const summary = formatScopeSummary(
			["d1:write", "artifacts.read", "dns.read", "ai.read", "d1.read"],
			catalogue
		);

		expect(summary.split("\n").map((line) => line.split(/ {2,}/)[0])).toEqual([
			"AI & Machine Learning",
			"Developer Platform",
			"DNS & Zones",
			"Other",
			"Uncategorized",
		]);
	});

	it("narrows by product name and by scope id", () => {
		const granted = ["d1.read", "queues.read", "dns.read"];

		expect(
			formatScopeGroups(granted, catalogue, { product: "developer" })
		).not.toContain("DNS");
		expect(
			formatScopeGroups(granted, catalogue, { filter: "d1" })
		).not.toContain("queues");
		expect(
			formatScopeGroups(granted, catalogue, { product: "dns", filter: "d1" })
		).toBe("");
	});

	it("matches products from the start of a word", () => {
		const granted = [
			"ai.read",
			"email-sending.write",
			"ssl-and-certificates.write",
		];

		expect(
			formatScopeGroups(granted, catalogue, { product: "ai" })
		).not.toContain("Email");
		expect(
			formatScopeGroups(granted, catalogue, { product: "perf" })
		).toContain("Cache & Performance");
	});

	it("matches products by resource and catalogue name as well as area", () => {
		const granted = [
			"workers-scripts.write",
			"d1.read",
			"dns.read",
			"d1:write",
		];

		const workers = formatScopeGroups(granted, catalogue, {
			product: "workers",
		});
		expect(workers).toContain("workers-scripts");
		expect(workers).not.toContain("d1");
		expect(workers).not.toContain("DNS");
		// d1:write has no catalogue entry, so only its resource can match.
		expect(formatScopeGroups(granted, catalogue, { product: "d1" }))
			.toMatchInlineSnapshot(`
			"Developer Platform (2/5)
			  d1  read

			Uncategorized (1/463)
			  d1  write"
		`);
		expect(
			formatScopeGroups(["ssl-and-certificates.write"], catalogue, {
				product: "certificates",
			})
		).toContain("ssl-and-certificates");
	});

	it("filters on either spelling of a scope", () => {
		const granted = ["workers_kv:write", "workers-kv-storage.read"];

		expect(
			formatScopeGroups(granted, catalogue, { filter: "workers-kv" })
		).toMatch(/workers-kv-storage +read[\s\S]*workers_kv +write/);
		expect(
			formatScopeGroups(granted, catalogue, { filter: "workers_kv" })
		).toMatch(/workers-kv-storage +read/);
	});

	it("counts default scopes per category and custom scopes apart", () => {
		const defaults = DefaultScopeKeys.filter(
			(scope) => catalogue.get(scope)?.category === "developer_platform"
		).length;
		const summary = formatScopeSummary(
			["d1.read", "custom-tool.run", "new-thing.read"],
			catalogue
		);

		expect(summary).toContain(`1/${defaults} + 1 custom`);
		expect(summary).toMatch(/Brand New & Shiny +1 custom/);
	});
});
