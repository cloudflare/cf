import { describe, expect, it } from "vite-plus/test";
import { computeVariantPromptBlock } from "../../../generator/emit/handler/variant-prompt.js";
import type { ArgIR } from "../../../generator/intermediate-representation.js";
import type { OperationInfo } from "@cloudflare/forge";

function bodyArg(name: string, type: ArgIR["type"]): ArgIR {
	return {
		name,
		description: `${name} description`,
		type,
		required: false,
		positional: false,
		origin: { kind: "body", apiFieldPath: [name.replace(/-/g, "_")] },
		isZone: false,
		isWorkerName: false,
	};
}

function operation(variants: Record<string, string[]>): OperationInfo {
	return {
		bodyDiscriminator: { field: "kind", variants },
	} as unknown as OperationInfo;
}

describe("computeVariantPromptBlock", () => {
	it("prompts for missing string fields", () => {
		const result = computeVariantPromptBlock(
			operation({ report: ["reason"] }),
			[bodyArg("kind", "string"), bodyArg("reason", "string")]
		);

		expect(result.needsTextPrompt).toBe(true);
		expect(result.lines.join("\n")).toContain(
			`argv["reason"] = await promptForRequiredField('reason'`
		);
	});

	it("recognizes a positional discriminator", () => {
		const kind = { ...bodyArg("kind", "string"), positional: true };
		const result = computeVariantPromptBlock(
			operation({ report: ["reason"] }),
			[kind, bodyArg("reason", "string")]
		);

		expect(result.needsTextPrompt).toBe(true);
		expect(result.lines.join("\n")).toContain(
			`if (argv["kind"] === 'report' && argv["reason"] === undefined)`
		);
	});

	it.each(["number", "boolean", "array"] as const)(
		"requires missing %s fields without prompting",
		(type) => {
			const result = computeVariantPromptBlock(
				operation({ report: ["value"] }),
				[bodyArg("kind", "string"), bodyArg("value", type)]
			);

			expect(result.needsTextPrompt).toBe(false);
			expect(result.lines.join("\n")).toContain(
				`throw new Error('--value is required (or pass --body with this field set).');`
			);
			expect(result.lines.join("\n")).not.toContain("promptForRequiredField");
		}
	);

	it("requires --body when a variant has an unexposed required field", () => {
		const result = computeVariantPromptBlock(
			operation({ key: ["algorithm", "format"] }),
			[bodyArg("kind", "string"), bodyArg("format", "enum")]
		);

		expect(result.needsTextPrompt).toBe(false);
		expect(result.lines.join("\n")).toContain(
			"The key variant requires algorithm, which cannot be supplied as flags. Pass --body"
		);
		expect(result.lines.join("\n")).not.toContain("promptForRequiredField");
	});
});
