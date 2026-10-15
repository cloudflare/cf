import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

type Json = Record<string, unknown>;

function generate(httpMethod: string, schema: Json, overrides: Json = {}) {
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "Default metadata", version: "1" },
		paths: {
			"/things": {
				[httpMethod]: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "save",
					summary: "Save a thing",
					"x-forge-params": { page: { default: 1 }, ...overrides },
					parameters: [
						{ name: "page", in: "query", schema: { type: "integer" } },
					],
					requestBody: {
						content: { "application/json": { schema } },
					},
					responses: {
						"200": {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
				},
			},
		},
	});
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	const command = metadata.commands.find((c) => c.command === "cf things save");
	const code = files.get("things/save.ts");
	if (command === undefined || code === undefined) {
		throw new Error("Missing generated things save command");
	}
	return { command, code };
}

function expectDefault(
	generated: ReturnType<typeof generate>,
	flag: string,
	value: unknown
) {
	const metadata = generated.command.options.find((o) => o.name === flag);
	const match = generated.code.match(
		new RegExp(`\\.option\\('${flag}', (\\{[^\\n]*\\})\\)`)
	);
	expect(metadata, `metadata for --${flag}`).toBeDefined();
	expect(match, `builder for --${flag}`).not.toBeNull();
	const builder = JSON.parse(match?.[1] ?? "") as Json;
	for (const option of [metadata, builder]) {
		if (value === undefined) {
			expect(option).not.toHaveProperty("default");
		} else {
			expect(option).toHaveProperty("default", value);
		}
	}
}

describe("command metadata defaults", () => {
	it.each(["post", "patch", "put"])(
		"matches the defaults applied by the %s command builder",
		(httpMethod) => {
			const generated = generate(httpMethod, {
				type: "object",
				required: ["settings"],
				properties: {
					enabled: { type: "boolean", default: false },
					retries: { type: "integer", default: 0 },
					label: { type: "string", default: "" },
					settings: {
						type: "object",
						properties: { enabled: { type: "boolean", default: true } },
					},
				},
			});
			const create = httpMethod === "post";
			expectDefault(generated, "enabled", create ? false : undefined);
			expectDefault(generated, "retries", create ? 0 : undefined);
			expectDefault(generated, "label", create ? "" : undefined);
			expectDefault(generated, "settings-enabled", create ? true : undefined);
			expectDefault(generated, "page", 1);
		}
	);

	it.each(["patch", "put"])(
		"retains the discriminator default for %s bodies",
		(httpMethod) => {
			const generated = generate(httpMethod, {
				discriminator: { propertyName: "kind" },
				oneOf: ["a", "b"].map((kind) => ({
					type: "object",
					required: ["kind"],
					properties: {
						kind: { type: "string", enum: [kind], default: kind },
						enabled: { type: "boolean", default: false },
					},
				})),
			});
			expectDefault(generated, "kind", "a");
			expectDefault(generated, "enabled", undefined);
		}
	);

	it("omits defaults on both sides of conflicting flags", () => {
		const generated = generate("post", {
			oneOf: [
				{
					type: "object",
					required: ["certificate_id"],
					properties: {
						certificate_id: {
							type: "string",
							"x-fern-property-name": "certificateId",
							default: "default-certificate",
						},
					},
				},
				{
					type: "object",
					required: ["token"],
					properties: { token: { type: "string", default: "default-token" } },
				},
			],
		});
		expectDefault(generated, "certificate-id", undefined);
		expectDefault(generated, "token", undefined);
	});

	it("omits defaults for repeated and JSON-valued flags", () => {
		const generated = generate(
			"post",
			{
				type: "object",
				properties: {
					tags: { type: "array", items: { type: "string" } },
					entries: {
						type: "array",
						items: { type: "object", properties: { name: { type: "string" } } },
					},
					labels: { type: "object", additionalProperties: { type: "string" } },
				},
			},
			{
				tags: { default: ["default-tag"] },
				entries: { default: [{ name: "default-entry" }] },
				labels: { default: { name: "default-label" } },
			}
		);
		for (const flag of ["tags", "entries", "labels"]) {
			expectDefault(generated, flag, undefined);
		}
	});
});
