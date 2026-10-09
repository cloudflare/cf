import { describe, expect, it } from "vite-plus/test";
import { deriveArgsFromOp } from "../../../generator/arg-derivation.js";
import { generateBuilderLines } from "../../../generator/emit/builder.js";
import { emitBodyArgValue } from "../../../generator/emit/handler/body-object.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

function operation(queryParamName: string, sdkName?: string): OperationInfo {
	return {
		path: "/accounts/{account_id}/example",
		method: "get",
		description: "Example operation",
		pathParams: [],
		queryParams: [
			{
				name: queryParamName,
				...(sdkName === undefined ? {} : { sdkName }),
				type: "string",
				required: true,
				description: "Search query",
			},
		],
		headerParams: [],
		bodyParams: [],
		hasRequestBody: false,
		requestContentTypes: [],
		requestBodyRef: null,
		requestBodyRequired: [],
		requestBodyIsArray: false,
		requestBodyArrayItemRef: null,
		responses: {},
	} as unknown as OperationInfo;
}

function method(
	params?: Schema.method["params"],
	name = "search"
): Schema.method {
	return {
		name,
		operationId: "example-search",
		params,
	} as Schema.method;
}

function multipartOperation(): OperationInfo {
	return {
		path: "/accounts/{account_id}/example",
		method: "post",
		description: "Example operation",
		pathParams: [],
		queryParams: [],
		headerParams: [],
		bodyParams: [],
		hasRequestBody: true,
		requestContentTypes: ["multipart/form-data"],
		requestBodyRef: null,
		requestBodyRequired: [],
		requestBodyIsArray: false,
		requestBodyArrayItemRef: null,
		multipart: {
			fields: [
				{
					name: "mode",
					type: "string",
					isBinary: false,
					required: false,
					description: "Mode",
				},
				{
					name: "Mode",
					type: "string",
					isBinary: false,
					required: false,
					description: "Mixed-case mode",
				},
				{
					name: "MODE",
					type: "string",
					isBinary: false,
					required: false,
					description: "Uppercase mode",
				},
				{
					name: "label",
					type: "string",
					isBinary: false,
					required: false,
					description: "Label",
				},
			],
			payloadField: undefined,
		},
		responses: {},
	} as unknown as OperationInfo;
}

function pathOperation(
	path: string,
	pathParams: { name: string; sdkName?: string }[]
): OperationInfo {
	return {
		...operation("unused"),
		path,
		queryParams: [],
		pathParams: [
			{ name: "account_id", required: true, type: "string" },
			...pathParams.map((p) => ({ ...p, required: true, type: "string" })),
		],
	} as unknown as OperationInfo;
}

describe("deriveArgsFromOp query flags", () => {
	it("names the flag from sdkName without changing the query wire name", () => {
		const derived = deriveArgsFromOp(
			method(),
			"example",
			operation("q", "query")
		);

		expect(derived.args).toContainEqual(
			expect.objectContaining({
				name: "query",
				origin: { kind: "query", wireName: "q" },
			})
		);
	});

	it("kebab-cases a camelCase sdkName", () => {
		const derived = deriveArgsFromOp(
			method(),
			"example",
			operation("accountId", "filterAccountId")
		);

		expect(derived.args.map((arg) => arg.name)).toEqual(["filter-account-id"]);
	});

	it("lets sdkName move a query param off the reserved mode flag", () => {
		expect(
			deriveArgsFromOp(method(), "example", operation("mode")).args
		).toEqual([]);

		const derived = deriveArgsFromOp(
			method(),
			"example",
			operation("mode", "search-mode")
		);
		expect(derived.args).toContainEqual(
			expect.objectContaining({
				name: "search-mode",
				origin: { kind: "query", wireName: "mode" },
			})
		);
	});

	it("classifies by the wire name", () => {
		const derived = deriveArgsFromOp(
			method(),
			"example",
			operation("zone_id", "zone_tag")
		);

		expect(derived.args).toContainEqual(
			expect.objectContaining({ name: "zone-tag", isZone: true })
		);
	});
});

describe("deriveArgsFromOp header flags", () => {
	it("names the flag from sdkName without changing the header wire name", () => {
		const derived = deriveArgsFromOp(method(), "example", {
			...operation("unused"),
			queryParams: [],
			headerParams: [
				{
					name: "cf-r2-jurisdiction",
					sdkName: "jurisdiction",
					type: "string",
					required: false,
					description: "Jurisdiction",
				},
			],
		} as unknown as OperationInfo);

		expect(derived.args).toContainEqual(
			expect.objectContaining({
				name: "jurisdiction",
				origin: { kind: "header", wireName: "cf-r2-jurisdiction" },
			})
		);
	});
});

describe("deriveArgsFromOp path params", () => {
	const path =
		"/accounts/{account_id}/queues/{queue_id}/consumers/{consumer_id}";
	const renamed = [
		{ name: "queue_id", sdkName: "queue" },
		{ name: "consumer_id", sdkName: "consumer" },
	];

	it("names the positional and demoted flag from sdkName", () => {
		const derived = deriveArgsFromOp(
			method(undefined, "get"),
			"example",
			pathOperation(path, renamed)
		);

		expect(derived.args).toEqual([
			expect.objectContaining({
				name: "queue",
				positional: false,
				required: true,
				origin: { kind: "path", wireName: "queue_id" },
			}),
			expect.objectContaining({
				name: "consumer",
				positional: true,
				origin: { kind: "path", wireName: "consumer_id" },
			}),
		]);
	});

	it("demotes every renamed path param to a flag for list operations", () => {
		const derived = deriveArgsFromOp(
			method(undefined, "list"),
			"example",
			pathOperation(path, renamed)
		);

		expect(
			derived.args.map((arg) => [arg.name, arg.positional, arg.origin])
		).toEqual([
			["queue", false, { kind: "path", wireName: "queue_id" }],
			["consumer", false, { kind: "path", wireName: "consumer_id" }],
		]);
	});

	it("keeps wire-name zone and worker handling when renamed", () => {
		const zoneDerived = deriveArgsFromOp(
			method(undefined, "get"),
			"example",
			pathOperation("/zones/{zone_id}/things/{thing_id}", [
				{ name: "zone_id", sdkName: "zone_tag" },
				{ name: "thing_id" },
			])
		);
		expect(zoneDerived.args.map((arg) => arg.name)).toEqual(["thing-id"]);

		const workerDerived = deriveArgsFromOp(
			method(undefined, "get"),
			"workers",
			pathOperation(
				"/accounts/{account_id}/workers/scripts/{script_name}/settings",
				[{ name: "script_name", sdkName: "worker_script" }]
			)
		);
		expect(workerDerived.args).toEqual([
			expect.objectContaining({
				name: "worker",
				positional: false,
				isWorkerName: true,
				origin: { kind: "path", wireName: "script_name" },
			}),
		]);
	});

	it("does not let a rename make an ordinary param look like a zone", () => {
		const derived = deriveArgsFromOp(
			method(undefined, "get"),
			"example",
			pathOperation("/accounts/{account_id}/things/{thing_id}", [
				{ name: "thing_id", sdkName: "zone_id" },
			])
		);

		expect(derived.args).toEqual([
			expect.objectContaining({
				name: "zone-id",
				positional: true,
				isZone: false,
			}),
		]);
	});
});

describe("deriveArgsFromOp body flags", () => {
	it("uses forge's Fern-derived names for flags and conflicts", () => {
		const derived = deriveArgsFromOp(method(undefined, "create"), "example", {
			...operation("unused"),
			method: "post",
			queryParams: [],
			bodyParams: [
				{
					name: "mtls-certificate-id",
					type: "string",
					required: false,
					description: "Certificate",
					apiFieldPath: ["mtls", "mtls_certificate_id"],
					conflicts: ["token"],
				},
				{
					name: "token",
					type: "string",
					required: false,
					description: "Token",
					apiFieldPath: ["access_token"],
					implies: ["mtls-certificate-id"],
				},
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		} as unknown as OperationInfo);

		expect(derived.args).toEqual([
			expect.objectContaining({
				name: "mtls-certificate-id",
				origin: {
					kind: "body",
					apiFieldPath: ["mtls", "mtls_certificate_id"],
				},
				conflicts: ["token"],
			}),
			expect.objectContaining({
				name: "token",
				origin: { kind: "body", apiFieldPath: ["access_token"] },
				implies: ["mtls-certificate-id"],
			}),
		]);
	});
});

describe("deriveArgsFromOp multipart flags", () => {
	it("omits reserved mode fields case-insensitively", () => {
		const derived = deriveArgsFromOp(method(), "example", multipartOperation());

		expect(derived.multipartFlagFields.map((field) => field.name)).toEqual([
			"label",
		]);
	});
});

describe("deriveArgsFromOp object-array body flags", () => {
	function bodyOperation(itemType?: string): OperationInfo {
		return {
			path: "/accounts/{account_id}/workers/deployments",
			method: "post",
			description: "Create a deployment",
			pathParams: [],
			queryParams: [],
			headerParams: [],
			bodyParams: [
				{
					name: "versions",
					type: "array",
					...(itemType === undefined ? {} : { itemType }),
					required: true,
					description: "Deployment versions as JSON.",
					apiFieldPath: ["versions"],
				},
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
			requestBodyRef: null,
			requestBodyRequired: ["versions"],
			requestBodyIsArray: false,
			requestBodyArrayItemRef: null,
			responses: {},
		} as unknown as OperationInfo;
	}

	it("keeps an object array as one JSON-valued flag", () => {
		const derived = deriveArgsFromOp(
			method(),
			"workers",
			bodyOperation("object")
		);

		expect(derived.args).toContainEqual(
			expect.objectContaining({
				name: "versions",
				type: "object-array",
				required: true,
				description:
					"Deployment versions as JSON. Provide as a JSON array of objects or @path/to/file.json.",
				origin: { kind: "body", apiFieldPath: ["versions"] },
			})
		);
		expect(derived.hasBody).toBe(true);
		expect(derived.hasBodyParams).toBe(true);
	});

	it("preserves scalar arrays as repeatable flags", () => {
		const derived = deriveArgsFromOp(method(), "workers", bodyOperation());

		expect(derived.args).toContainEqual(
			expect.objectContaining({ name: "versions", type: "array" })
		);
	});

	it("does not let scalar overlay choices replace the JSON representation", () => {
		const derived = deriveArgsFromOp(
			method({
				versions: {
					choices: ["not-an-object-array"],
					positional: true,
				},
			}),
			"workers",
			bodyOperation("object")
		);

		expect(derived.args).toContainEqual(
			expect.objectContaining({
				name: "versions",
				type: "object-array",
				positional: false,
			})
		);
		expect(derived.args.find((arg) => arg.name === "versions")?.choices).toBe(
			undefined
		);
	});
});

describe("file-backed enum arguments", () => {
	it("resolves enum file tokens before choices validation without reading twice", () => {
		const createMethod = method(undefined, "create");
		const createOperation = {
			...operation("sort"),
			method: "post",
			queryParams: [
				{ name: "sort", type: "string", enumValues: ["asc", "desc"] },
			],
			bodyParams: [
				{
					name: "selection",
					type: "string",
					apiFieldPath: ["selection"],
					enumValues: ["first", "second"],
				},
				{
					name: "description",
					type: "string",
					apiFieldPath: ["description"],
				},
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		} as unknown as OperationInfo;
		const derived = deriveArgsFromOp(createMethod, "example", createOperation);
		const builder = generateBuilderLines(
			createMethod,
			"example",
			createOperation,
			"json",
			derived
		).join("\n");
		const enumArg = derived.args.find((arg) => arg.name === "selection");
		const textArg = derived.args.find((arg) => arg.name === "description");

		expect(builder).toContain('"choices":["first","second"]');
		expect(builder).toContain(
			'.coerce("selection", (value: string | undefined) => resolveFileToken(value, "selection", "text"))'
		);
		expect(builder).not.toContain('.coerce("sort"');
		expect(builder).not.toContain('.coerce("description"');
		if (!enumArg || !textArg) {
			throw new Error("Expected derived body arguments");
		}
		expect(emitBodyArgValue(enumArg, 'argv["selection"]')).toBe(
			'argv["selection"]'
		);
		expect(emitBodyArgValue(textArg, 'argv["description"]')).toContain(
			'resolveFileToken(argv["description"]'
		);
	});
});
