import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

const JSON_BODY = "Raw JSON request body (bypasses individual flags)";
const PLAIN = "Send the workflow name as plain text, without JSON quotes.";

function metadataDescription(contentType: string, description?: string) {
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
						content: { [contentType]: { schema: { type: "string" } } },
					},
					responses: { "200": { description: "OK" } },
				},
			},
		},
	});
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	return metadata.commands
		.find((c) => c.command === "cf things update")
		?.options.find((o) => o.name === "body")?.description;
}

describe("--body metadata description", () => {
	it("matches --help for a text/plain body", () => {
		expect(metadataDescription("text/plain", PLAIN)).toBe(PLAIN);
	});

	it.each([
		["text/plain", undefined],
		["application/json", PLAIN],
		["application/octet-stream", PLAIN],
	])("keeps the JSON wording for %s (description: %j)", (type, description) => {
		expect(metadataDescription(type, description)).toBe(JSON_BODY);
	});
});
