import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

type Json = Record<string, unknown>;

function generate(schema: Json, schemas: Json = {}) {
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "Variant descriptions", version: "1" },
		components: { schemas },
		paths: {
			"/things": {
				post: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "create",
					summary: "Create a thing",
					requestBody: { content: { "application/json": { schema } } },
					responses: { "200": { description: "OK" } },
				},
			},
		},
	});
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	const command = metadata.commands.find(
		(c) => c.command === "cf things create"
	);
	const code = files.get("things/create.ts");
	if (command === undefined || code === undefined) {
		throw new Error("Missing generated things create command");
	}
	return { files, command, code };
}

function option(generated: ReturnType<typeof generate>, flag: string) {
	const metadata = generated.command.options.find((o) => o.name === flag);
	const match = generated.code.match(
		new RegExp(`\\.option\\('${flag}', (\\{[^\\n]*\\})\\)`)
	);
	expect(metadata, `metadata for --${flag}`).toBeDefined();
	expect(match, `builder for --${flag}`).not.toBeNull();
	const builder = JSON.parse(match?.[1] ?? "") as Json;
	expect(builder["description"]).toBe(metadata?.description);
	return { metadata, builder };
}

const variants = [
	{
		type: "object",
		required: ["target", "value"],
		properties: {
			target: {
				type: "string",
				enum: ["ip"],
				description: "Match an IP address.",
			},
			value: { type: "string", description: "The IP address to match." },
		},
	},
	{
		type: "object",
		required: ["target", "value"],
		properties: {
			target: {
				type: "string",
				enum: ["ip_range"],
				description: "Match an IP range.",
			},
			value: {
				type: "string",
				description: "The IP range. Only /16 and /24 are allowed.",
			},
		},
	},
];

describe("merged variant descriptions", () => {
	it.each(["root", "nested", "shared-object"])(
		"preserves enum and scalar descriptions in %s unions",
		(location) => {
			const schema =
				location === "root"
					? { oneOf: variants }
					: location === "nested"
						? {
								type: "object",
								properties: { configuration: { oneOf: variants } },
							}
						: {
								oneOf: variants.map((variant) => ({
									type: "object",
									properties: { configuration: { allOf: [variant] } },
								})),
							};
			const generated = generate(schema);
			const prefix = location === "root" ? "" : "configuration-";
			const target = option(generated, `${prefix}target`);
			expect(target.builder).toMatchObject({
				choices: ["ip", "ip_range"],
				description:
					"Variant descriptions:\n- `ip`: Match an IP address.\n- `ip_range`: Match an IP range.",
			});
			expect(target.metadata?.required).toBe(location === "root");
			expect(option(generated, `${prefix}value`).builder).toMatchObject({
				description:
					"Variant descriptions:\n- The IP address to match.\n- The IP range. Only /16 and /24 are allowed.",
			});
		}
	);

	it("deduplicates descriptions and groups their enum values in source order", () => {
		const generated = generate({
			oneOf: [
				["first", "First description."],
				["second", "Second description."],
				["third", " First description. "],
				["fourth", ""],
			].map(([value, description]) => ({
				type: "object",
				properties: {
					selection: { type: "string", enum: [value], description },
				},
			})),
		});
		expect(option(generated, "selection").builder).toMatchObject({
			choices: ["first", "second", "third", "fourth"],
			description:
				"Variant descriptions:\n- `first`, `third`: First description.\n- `second`: Second description.",
		});
		expect(generate({ oneOf: variants }).files).toEqual(
			generate({ oneOf: variants }).files
		);
	});

	it.each([undefined, "", "   ", "Shared description."])(
		"keeps one useful description without alternative labels (other: %j)",
		(description) => {
			const generated = generate({
				oneOf: [description, "Shared description.", description].map(
					(text) => ({
						type: "object",
						properties: { value: { type: "string", description: text } },
					})
				),
			});
			expect(option(generated, "value").builder["description"]).toBe(
				"Shared description."
			);
		}
	);

	it("labels an enum description that covers only some choices", () => {
		const generated = generate({
			oneOf: [
				{
					type: "object",
					properties: { target: { type: "string", enum: ["first"] } },
				},
				{
					type: "object",
					properties: {
						target: {
							type: "string",
							enum: ["second"],
							description: "Only the second choice.",
						},
					},
				},
			],
		});
		expect(option(generated, "target").builder).toMatchObject({
			choices: ["first", "second"],
			description: "Variant descriptions:\n- `second`: Only the second choice.",
		});
	});

	it.each(["string", "number", "boolean", "array"])(
		"deduplicates repeated non-enum %s descriptions",
		(type) => {
			const generated = generate({
				oneOf: [
					"First description.",
					"Second description.",
					"First description.",
				].map((description) => ({
					type: "object",
					properties: {
						value: {
							type,
							description,
							...(type === "array" ? { items: { type: "string" } } : {}),
						},
					},
				})),
			});
			expect(option(generated, "value").builder["description"]).toBe(
				"Variant descriptions:\n- First description.\n- Second description."
			);
		}
	);

	it("retains referenced descriptions and leaves identical prose unchanged", () => {
		const generated = generate(
			{
				oneOf: ["First", "Second", "First"].map((name) => ({
					type: "object",
					properties: {
						value: { $ref: `#/components/schemas/${name}` },
						shared: { type: "string", description: "Shared description.\n" },
					},
				})),
			},
			{
				First: { type: "string", description: "First description." },
				Second: { type: "string", description: "Second description." },
			}
		);
		expect(option(generated, "value").builder["description"]).toBe(
			"Variant descriptions:\n- First description.\n- Second description."
		);
		expect(option(generated, "shared").builder["description"]).toBe(
			"Shared description.\n"
		);
	});

	it("leaves object anyOf alternatives to --body", () => {
		const generated = generate({ anyOf: variants });
		expect(generated.command.options.map((o) => o.name)).not.toContain(
			"target"
		);
		expect(generated.command.options.map((o) => o.name)).not.toContain("value");
	});
});
