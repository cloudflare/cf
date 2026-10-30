import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

type Json = Record<string, unknown>;

function save(overrides: Json): Json {
	return {
		"x-fern-sdk-group-name": "things",
		"x-fern-sdk-method-name": "save",
		summary: "Save a thing",
		"x-forge-params": overrides,
		parameters: [
			{
				name: "thing_id",
				in: "path",
				required: true,
				schema: { type: "string" },
			},
			{ name: "q", in: "query", schema: { type: "string" } },
			{ name: "cf-mode", in: "header", schema: { type: "string" } },
		],
		requestBody: {
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							mode: { type: "string" },
							settings: {
								type: "object",
								properties: { mode: { type: "string" } },
							},
						},
					},
				},
			},
		},
		responses: {
			"200": {
				description: "OK",
				content: { "application/json": { schema: { type: "object" } } },
			},
		},
	};
}

function generate(paths: Json): Map<string, string> {
	return generateFiles({
		openapi: "3.0.3",
		info: { title: "Flag names", version: "1" },
		paths,
	});
}

describe("x-forge-params flagName through forge", () => {
	it("renames each kind of field's flag and sends its wire name", () => {
		const files = generate({
			"/things/{thing_id}": {
				put: save({
					thing_id: { flagName: "thing" },
					q: { flagName: "search-query" },
					"cf-mode": { flagName: "routing-mode" },
					mode: { flagName: "filter-mode" },
					"settings.mode": { flagName: "settings-filter-mode" },
				}),
			},
		});
		const { commands } = JSON.parse(files.get("_meta/commands.json") ?? "") as {
			commands: CommandMeta[];
		};
		const command = commands.find((c) => c.command === "cf things save");
		expect(command?.arguments.map((a) => a.name)).toEqual(["thing"]);
		expect(command?.options.map((o) => o.name)).toEqual(
			expect.arrayContaining([
				"search-query",
				"routing-mode",
				"filter-mode",
				"settings-filter-mode",
			])
		);
		const code = files.get("things/save.ts") ?? "";
		expect(code).toContain(
			'`/things/${encodeURIComponent(String(argv["thing"]))}'
		);
		expect(code).toContain(`'q': argv["search-query"]`);
		expect(code).toContain(`headers['cf-mode'] = String(argv["routing-mode"])`);
		expect(code).toContain(
			'setNestedValue(bodyData, ["mode"], resolveFileToken(argv["filter-mode"]'
		);
		expect(code).toContain(
			'setNestedValue(bodyData, ["settings", "mode"], resolveFileToken(argv["settings-filter-mode"]'
		);
	});

	it("reports every clashing operation of the catalogue in one error", () => {
		const clashing = (name: string): Json => ({
			...save({}),
			"x-fern-sdk-method-name": name,
			parameters: [
				{ name: "profile", in: "query", schema: { type: "string" } },
			],
			requestBody: undefined,
		});
		expect(() =>
			generate({
				"/things/a": { get: clashing("first") },
				"/things/b": { get: clashing("second") },
			})
		).toThrow(
			/2 command\(s\) failed to generate[\s\S]*GET \/things\/a \(things\.first\)[\s\S]*GET \/things\/b \(things\.second\)/
		);
	});
});
