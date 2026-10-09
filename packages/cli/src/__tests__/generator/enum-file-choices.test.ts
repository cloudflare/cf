import { describe, expect, it } from "vite-plus/test";
import { deriveArgsFromOp } from "../../../generator/arg-derivation.js";
import { generateBuilderLines } from "../../../generator/emit/builder.js";
import { emitBodyArgValue } from "../../../generator/emit/handler/body-object.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

const method = {
	name: "create",
	operationId: "test-create",
} as Schema.method;
const opInfo = {
	path: "/tests",
	method: "post",
	pathParams: [],
	queryParams: [{ name: "sort", type: "string", enumValues: ["asc", "desc"] }],
	headerParams: [],
	bodyParams: [
		{
			name: "widget-mode",
			type: "string",
			apiFieldPath: ["widget_mode"],
			enumValues: ["manual", "auto"],
		},
		{
			name: "description",
			type: "string",
			apiFieldPath: ["description"],
		},
	],
	hasRequestBody: true,
	requestContentTypes: ["application/json"],
	requestBodyRef: null,
	requestBodyRequired: [],
	requestBodyIsArray: false,
	responses: {},
} as unknown as OperationInfo;

describe("generated enum file choices", () => {
	it("resolves file-backed enums before yargs choices without resolving twice", () => {
		const derived = deriveArgsFromOp(method, "tests", opInfo);
		const builder = generateBuilderLines(
			method,
			"tests",
			opInfo,
			"json",
			derived
		).join("\n");
		const mode = derived.args.find((arg) => arg.name === "widget-mode");
		const description = derived.args.find((arg) => arg.name === "description");

		expect(builder).toContain('"choices":["manual","auto"]');
		expect(builder).toContain(
			'.coerce("widget-mode", (value: string | undefined) => resolveFileToken(value, "widget-mode", "text"))'
		);
		expect(builder).not.toContain('.coerce("sort"');
		expect(builder).not.toContain('.coerce("description"');
		expect(mode).toBeDefined();
		expect(description).toBeDefined();
		if (!mode || !description) {
			throw new Error("Expected derived arguments");
		}
		expect(emitBodyArgValue(mode, 'argv["widget-mode"]')).toBe(
			'argv["widget-mode"]'
		);
		expect(emitBodyArgValue(description, 'argv["description"]')).toContain(
			'resolveFileToken(argv["description"]'
		);
	});
});
