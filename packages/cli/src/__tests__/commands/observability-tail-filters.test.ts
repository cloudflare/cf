import { describe, expect, it } from "vite-plus/test";
import {
	scopeTailFilters,
	tailFilters,
	zoneFilter,
} from "../../commands/observability/tail/filters.js";

describe("zone selection", () => {
	const selection = zoneFilter("Example.COM");
	const fallback = selection.filters[1];
	if (!fallback || fallback.kind !== "group") {
		throw new Error("Expected a hostname fallback group.");
	}
	const hostname = fallback.filters[1];
	if (!hostname || hostname.kind === "group") {
		throw new Error("Expected a URL hostname condition.");
	}
	const matches = (url: string) => new RegExp(String(hostname.value)).test(url);

	it("prefers the processing zone and uses a hostname fallback for absent zone fields", () => {
		expect(selection).toEqual({
			kind: "group",
			filterCombination: "or",
			filters: [
				{
					key: "cloudflare.zone_name",
					type: "string",
					operation: "eq",
					value: "example.com",
				},
				{
					kind: "group",
					filterCombination: "and",
					filters: [
						{
							key: "cloudflare.zone_name",
							type: "string",
							operation: "is_null",
						},
						{
							key: "$metadata.url",
							type: "string",
							operation: "regex",
							value: expect.any(String),
						},
					],
				},
			],
		});
	});

	it.each([
		"https://example.com/",
		"http://example.com/path?view=all",
		"https://api.dev.example.com/",
		"https://example.com:8443/",
		"https://api.example.com.:8443/",
		"https://example.com",
		"https://example.com?query=1",
		"HTTPS://API.EXAMPLE.COM/path",
	])("matches the zone domain or its subdomains: %s", (url) => {
		expect(matches(url)).toBe(true);
	});

	it.each([
		"https://notexample.com/",
		"https://example.com.evil.test/",
		"https://exampleXcom/",
		"https://example.com@evil.test/",
		"https://evil.test/path/example.com/",
		"example.com",
	])("rejects unrelated request hostnames: %s", (url) => {
		expect(matches(url)).toBe(false);
	});

	it("ANDs the zone selection with a user's OR group", () => {
		const userFilters = tailFilters(
			JSON.stringify({
				filterCombination: "or",
				filters: ["error", "warn"].map((value) => ({
					key: "$metadata.level",
					type: "string",
					operation: "eq",
					value,
				})),
			})
		);
		const scope = zoneFilter("example.com");
		expect(scopeTailFilters(userFilters, scope)).toEqual({
			filterCombination: "and",
			filters: [scope, { kind: "group", ...userFilters }],
		});
	});
});
