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
});
