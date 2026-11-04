import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

function generate(contentType: string, description?: string) {
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "Body descriptions", version: "1" },
		paths: {
			"/things": {
				put: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "update",
					summary: "Update a thing",
					requestBody: {
						required: true,
						...(description === undefined ? {} : { description }),
						content: {
							[contentType]: {
								schema:
									contentType === "application/json"
										? { type: "array", items: { type: "string" } }
										: { type: "string" },
							},
						},
					},
					responses: { "200": { description: "OK" } },
				},
			},
		},
	});
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	const command = metadata.commands.find(
		(c) => c.command === "cf things update"
	);
	return {
		meta: command?.options.find((o) => o.name === "body")?.description,
		code: files.get("things/update.ts") ?? "",
	};
}

describe("--body description", () => {
	it.each([
		[
			"application/json",
			undefined,
			"Raw JSON request body (bypasses individual flags)",
		],
		[
			"text/plain",
			undefined,
			"Raw request body, sent as-is (or @path to send a file's contents)",
		],
		[
			"application/octet-stream",
			undefined,
			"Raw request body, sent as-is (or @path to send a file's contents)",
		],
		[
			"text/plain",
			"Send the value as plain text.",
			"Send the value as plain text.",
		],
	])(
		"matches --help in metadata for %s (description: %j)",
		(contentType, description, expected) => {
			const { meta, code } = generate(contentType, description);
			expect(meta).toBe(expected);
			expect(code).toContain(
				JSON.stringify(expected).slice(1, -1).replaceAll("'", "\\'")
			);
		}
	);
});
