import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

describe("Forge metadata normalization", () => {
	it("converts Fern command names before native Forge parsing", () => {
		const files = generateFiles({
			openapi: "3.0.3",
			info: { title: "Normalization", version: "1" },
			paths: {
				"/things": {
					get: {
						"x-fern-sdk-group-name": "normalized-things",
						"x-fern-sdk-method-name": "list-normalized",
						description: "List normalized things",
						responses: { "200": { description: "OK" } },
					},
				},
			},
		});
		const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
			commands: CommandMeta[];
		};

		expect(
			metadata.commands.some(
				(entry) => entry.command === "cf normalized-things list-normalized"
			)
		).toBe(true);
		expect(files.has("normalized-things/list-normalized.ts")).toBe(true);
	});

	it("normalizes option metadata names to match the command builder", () => {
		const files = generateFiles({
			openapi: "3.0.3",
			info: { title: "Option normalization", version: "1" },
			paths: {
				"/things": {
					post: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "create",
						description: "Create a thing",
						"x-forge-params": { orderBy: { default: "name" } },
						parameters: [
							{ name: "orderBy", in: "query", schema: { type: "string" } },
							{ name: "page_size", in: "query", schema: { type: "integer" } },
							{
								name: "q",
								in: "query",
								"x-fern-parameter-name": "searchQuery",
								schema: { type: "string" },
							},
						],
						requestBody: {
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											cacheTTL: { type: "integer" },
											settings: {
												type: "object",
												properties: { showHistoric: { type: "boolean" } },
											},
										},
									},
								},
							},
						},
						responses: { "200": { description: "OK" } },
					},
				},
			},
		});
		const { commands } = JSON.parse(files.get("_meta/commands.json") ?? "") as {
			commands: CommandMeta[];
		};
		const command = commands.find(
			(entry) => entry.command === "cf things create"
		);
		const code = files.get("things/create.ts") ?? "";
		const builderNames = Array.from(
			code.matchAll(/\.option\(['"]([^'"]+)['"],/g),
			(match) => match[1]
		);

		expect(command?.options.map((option) => option.name)).toEqual(builderNames);
		expect(builderNames).toEqual(
			expect.arrayContaining([
				"order-by",
				"page-size",
				"search-query",
				"cache-ttl",
				"settings-show-historic",
			])
		);
		expect(command?.options).toContainEqual(
			expect.objectContaining({ name: "order-by", default: "name" })
		);
	});
});
