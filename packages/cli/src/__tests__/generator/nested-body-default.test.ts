import { describe, expect, it } from "vitest";
import { deriveArgsFromOp } from "../../../generator/arg-derivation.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

const method = {
	name: "create",
	operationId: "test-create",
	description: "Create a test resource",
} as unknown as Schema.method;

function operation(
	bodyParams: OperationInfo["bodyParams"],
	requestBodyRequired: string[]
): OperationInfo {
	return {
		path: "/accounts/{account_id}/tests",
		method: "post",
		description: "Create a test resource",
		pathParams: [{ name: "account_id", required: true, type: "string" }],
		queryParams: [],
		headerParams: [],
		bodyParams,
		hasRequestBody: true,
		requestContentTypes: ["application/json"],
		requestBodyRef: null,
		requestBodyRequired,
		requestBodyIsArray: false,
	} as unknown as OperationInfo;
}

function defaultFor(
	opInfo: OperationInfo,
	name: string
): string | number | boolean | undefined {
	return deriveArgsFromOp(method, "test", opInfo).args.find(
		(arg) => arg.name === name
	)?.default;
}

describe("nested body defaults", () => {
	it("does not create an optional parent object", () => {
		const opInfo = operation(
			[
				{
					name: "format-type",
					required: true,
					type: "string",
					apiFieldPath: ["format", "type"],
				},
				{
					name: "format-compression",
					required: false,
					type: "string",
					apiFieldPath: ["format", "compression"],
					default: "uncompressed",
				},
			],
			[]
		);

		const derived = deriveArgsFromOp(method, "test", opInfo);
		expect(
			derived.args.find((arg) => arg.name === "format-compression")?.default
		).toBeUndefined();
		expect(derived.optionalParentGroups).toEqual([
			{
				parentName: "format",
				groupSetFlags: ["format-type", "format-compression"],
				requiredFlags: ["format-type"],
			},
		]);
	});

	it("retains a nested default when its parent is required", () => {
		expect(
			defaultFor(
				operation(
					[
						{
							name: "settings-mode",
							required: false,
							type: "string",
							apiFieldPath: ["settings", "mode"],
							default: "automatic",
						},
					],
					["settings"]
				),
				"settings-mode"
			)
		).toBe("automatic");
	});

	it("retains a default on a top-level field", () => {
		expect(
			defaultFor(
				operation(
					[
						{
							name: "strategy",
							required: false,
							type: "string",
							apiFieldPath: ["strategy"],
							default: "automatic",
						},
					],
					[]
				),
				"strategy"
			)
		).toBe("automatic");
	});

	it("omits the reserved top-level mode field", () => {
		const derived = deriveArgsFromOp(
			method,
			"test",
			operation(
				[
					{
						name: "mode",
						required: false,
						type: "string",
						apiFieldPath: ["mode"],
						default: "automatic",
					},
				],
				[]
			)
		);

		expect(derived.args.some((arg) => arg.name === "mode")).toBe(false);
	});
});
