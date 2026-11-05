import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

const JSON_BODY = "Raw JSON request body (bypasses individual flags)";
const PLAIN = "Send the workflow name as plain text, without JSON quotes.";
const PLAIN_BODY = "Plain-text request body (without JSON quotes)";

async function bodyDescriptions(contentTypes: string[], description?: string) {
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
						content: Object.fromEntries(
							contentTypes.map((type) => [type, { schema: { type: "string" } }])
						),
					},
					responses: { "200": { description: "OK" } },
				},
			},
		},
	});
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	const bodyDescription = metadata.commands
		.find((c) => c.command === "cf things update")
		?.options.find((o) => o.name === "body")?.description;
	const source = stripTypeScriptTypes(files.get("things/update.ts") ?? "")
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default command;", "command;");
	const command = new Script(source).runInNewContext() as CommandModule;
	const help = await yargs(["update"]).command(command).wrap(null).getHelp();
	return { metadata: bodyDescription, help };
}

describe.each([
	{ contentTypes: ["text/plain"] },
	{ contentTypes: ["text/plain;charset=UTF-8"] },
	{ contentTypes: ["text/plain", "text/plain; charset=UTF-8"] },
])("plain-text --body descriptions ($contentTypes)", ({ contentTypes }) => {
	it("uses the provided description in metadata and --help", async () => {
		const result = await bodyDescriptions(contentTypes, PLAIN);
		expect(result.metadata).toBe(PLAIN);
		expect(result.help).toContain(PLAIN);
	});

	it.each([undefined, ""])(
		"uses a plain-text fallback when the description is %j",
		async (description) => {
			const result = await bodyDescriptions(contentTypes, description);
			expect(result.metadata).toBe(PLAIN_BODY);
			expect(result.help).toContain(PLAIN_BODY);
			expect(result.help).not.toContain(JSON_BODY);
		}
	);
});

describe("other --body metadata descriptions", () => {
	it.each([
		{ contentTypes: ["application/json"] },
		{ contentTypes: ["application/octet-stream"] },
		{ contentTypes: ["text/plain", "application/json"] },
		{ contentTypes: ["application/json", "text/plain"] },
	])("keeps the JSON wording for $contentTypes", async ({ contentTypes }) => {
		const result = await bodyDescriptions(contentTypes, PLAIN);
		expect(result.metadata).toBe(JSON_BODY);
	});

	it("omits --body when no content types are declared", async () => {
		const result = await bodyDescriptions([], PLAIN);
		expect(result.metadata).toBeUndefined();
		expect(result.help).not.toContain("--body");
	});
});
