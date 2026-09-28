import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateBuilderLines } from "../../../generator/emit/builder.js";
import { emitBodyObject } from "../../../generator/emit/handler/body-object.js";
import { emitBodyPrompts } from "../../../generator/emit/handler/body-prompts.js";
import type { DerivedArgs } from "../../../generator/arg-derivation.js";
import type { EmitContext } from "../../../generator/emit/context.js";
import type { ArgIR } from "../../../generator/intermediate-representation.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

function bodyArg(
	name: string,
	type: "array" | "object-array",
	required = false
): ArgIR {
	return {
		name,
		description: `${name} description`,
		type,
		required,
		positional: false,
		origin: { kind: "body", apiFieldPath: [name] },
		isZone: false,
		isWorkerName: false,
	};
}

function derived(args: ArgIR[]): DerivedArgs {
	return {
		args,
		optionalParentGroups: [],
		isMutating: true,
		hasBody: true,
		hasEmptyBody: false,
		hasBodyParams: true,
		hasFileUpload: false,
		multipartInfo: undefined,
		multipartFlagFields: [],
	};
}

const method = { name: "create" } as Schema.method;
const opInfo = {
	method: "post",
	path: "/tests",
	requestContentTypes: ["application/json"],
} as OperationInfo;

describe("object-array body emission", () => {
	it("emits one string flag while scalar arrays remain repeatable", () => {
		const lines = generateBuilderLines(
			method,
			"tests",
			opInfo,
			"json",
			derived([
				bodyArg("versions", "object-array", true),
				bodyArg("tags", "array"),
			])
		);
		const versions = lines.find((line) =>
			line.startsWith(".option('versions'")
		);
		const tags = lines.find((line) => line.startsWith(".option('tags'"));

		expect(versions).toContain('"type":"string"');
		expect(versions).not.toContain('"array":true');
		expect(versions).not.toContain('"demandOption":true');
		expect(tags).toContain('"type":"string"');
		expect(tags).toContain('"array":true');
	});

	it("parses the complete JSON value when assembling the body", () => {
		const ctx = {
			derived: derived([bodyArg("versions", "object-array", true)]),
			requiredOptionArgs: [],
		} as unknown as EmitContext;

		expect(emitBodyObject(ctx, "").join("\n")).toContain(
			'versions: parseObjectArray(argv["versions"], "versions")'
		);
	});

	it("requires the JSON flag after the --body bypass", () => {
		const ctx = {
			derived: derived([bodyArg("versions", "object-array", true)]),
			variantPromptBlock: [],
		} as unknown as EmitContext;

		expect(emitBodyPrompts(ctx).join("\n")).toContain(
			"throw new Error('--versions is required (or pass --body with this field set).')"
		);
	});

	it("publishes the object array as one string option in command metadata", () => {
		const metadata = JSON.parse(
			readFileSync(
				new URL(
					"../../commands/_generated/_meta/commands.json",
					import.meta.url
				),
				"utf8"
			)
		) as {
			commands: Array<{
				command: string;
				arguments: Array<{ name: string }>;
				options: Array<{
					name: string;
					type: string;
					required: boolean;
				}>;
			}>;
		};
		const command = metadata.commands.find(
			(entry) => entry.command === "cf workers deployments create"
		);

		expect(command).toBeDefined();
		expect(command?.arguments).not.toContainEqual(
			expect.objectContaining({ name: "versions" })
		);
		expect(command?.options).toContainEqual(
			expect.objectContaining({
				name: "versions",
				type: "string",
				required: true,
			})
		);
	});
});
