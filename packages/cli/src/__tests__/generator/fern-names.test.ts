import { describe, expect, it } from "vitest";
import { buildEmitContext } from "../../../generator/emit/build-context.js";
import { generateBuilderLines } from "../../../generator/emit/builder.js";
import { emitHandler } from "../../../generator/emit/handler/index.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

function method(name: string, operationId: string): Schema.method {
	return {
		name,
		operationId,
		description: "Example operation",
	} as Schema.method;
}

function operation(overrides: Partial<OperationInfo>): OperationInfo {
	return {
		path: "/accounts/{account_id}/example",
		method: "get",
		description: "Example operation",
		pathParams: [],
		queryParams: [],
		headerParams: [],
		bodyParams: [],
		hasRequestBody: false,
		requestContentTypes: [],
		requestBodyRef: null,
		requestBodyRequired: [],
		requestBodyIsArray: false,
		requestBodyArrayItemRef: null,
		responses: { "200": { content: { "application/json": {} } } },
		...overrides,
	} as unknown as OperationInfo;
}

// Matches the real `queues-get-consumer` operation so the typed Fern SDK
// call is emitted, with renamed path parameters.
const renamedConsumerGet = operation({
	path: "/accounts/{account_id}/queues/{queue_id}/consumers/{consumer_id}",
	pathParams: [
		{ name: "account_id", required: true, type: "string" },
		{ name: "queue_id", sdkName: "queue", required: true, type: "string" },
		{
			name: "consumer_id",
			sdkName: "consumer",
			required: true,
			type: "string",
		},
	],
});

function emit(
	m: Schema.method,
	opInfo: OperationInfo,
	resourceName = "example"
): { handler: string; builder: string; resolvedRequestPath: string } {
	const { ctx } = buildEmitContext({
		method: m,
		resourceName,
		groupName: undefined,
		opInfo,
	});
	return {
		handler: emitHandler(ctx).join("\n"),
		builder: generateBuilderLines(
			m,
			resourceName,
			opInfo,
			ctx.outputKind,
			ctx.derived
		).join("\n"),
		resolvedRequestPath: ctx.resolvedRequestPath,
	};
}

describe("x-fern-parameter-name path renames", () => {
	it("reads renamed path args in the typed SDK call and dry run", () => {
		const { handler, builder } = emit(
			method("get", "queues-get-consumer"),
			renamedConsumerGet
		);

		expect(builder).toContain(".positional('consumer'");
		expect(builder).toContain(".option('queue'");
		expect(builder).not.toContain("queue-id");
		expect(builder).not.toContain("consumer-id");

		expect(handler).toContain('queue_id: argv["queue"]');
		expect(handler).toContain('consumer_id: argv["consumer"]');

		expect(handler).toContain(
			'/queues/${argv["queue"] == null ? \'<queue>\' : encodeURIComponent(String(argv["queue"]))}'
		);
		expect(handler).toContain(
			'/consumers/${argv["consumer"] == null ? \'<consumer>\' : encodeURIComponent(String(argv["consumer"]))}'
		);
		expect(handler).toContain('"queue": String(argv["queue"] ?? \'\')');
		expect(handler).toContain('"consumer": String(argv["consumer"] ?? \'\')');
		expect(handler).not.toContain('argv["queue-id"]');
		expect(handler).not.toContain('argv["consumer-id"]');
	});

	it("substitutes renamed path args into the raw request URL", () => {
		const { resolvedRequestPath, handler } = emit(
			method("get", "example-without-sdk-entry"),
			renamedConsumerGet
		);

		expect(resolvedRequestPath).toBe(
			'/accounts/${accountId}/queues/${encodeURIComponent(String(argv["queue"]))}/consumers/${encodeURIComponent(String(argv["consumer"]))}'
		);
		expect(handler).not.toContain('argv["queue-id"]');
	});

	it("does not treat a renamed path positional as a body field", () => {
		const { handler } = emit(
			method("update", "example-without-sdk-entry"),
			operation({
				path: "/accounts/{account_id}/things/{thing_id}",
				method: "put",
				pathParams: [
					{ name: "account_id", required: true, type: "string" },
					{
						name: "thing_id",
						sdkName: "thing",
						required: true,
						type: "string",
					},
				],
				bodyParams: [
					{
						name: "label",
						type: "string",
						required: false,
						description: "Label",
						apiFieldPath: ["label"],
					},
				],
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
			})
		);

		expect(handler).toContain('encodeURIComponent(String(argv["thing"]))');
		expect(handler).toContain('setNestedValue(bodyData, ["label"]');
		expect(handler).not.toContain('bodyData["thing"]');
		expect(handler).not.toMatch(/\bthing: /);
	});
});

describe("x-fern-property-name body renames", () => {
	it("emits forge's renamed body flags, conflicts, and wire paths", () => {
		const { handler, builder } = emit(
			method("create", "example-without-sdk-entry"),
			operation({
				path: "/accounts/{account_id}/configs",
				method: "post",
				pathParams: [{ name: "account_id", required: true, type: "string" }],
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
						conflicts: ["mtls-certificate-id"],
					},
				],
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
			})
		);

		expect(builder).toContain(".option('mtls-certificate-id'");
		expect(builder).toContain(".option('token'");
		expect(builder).toContain(".conflicts('mtls-certificate-id', ['token'])");
		expect(builder).toContain(".conflicts('token', ['mtls-certificate-id'])");
		expect(handler).toContain(
			'setNestedValue(bodyData, ["mtls", "mtls_certificate_id"], resolveFileToken(argv["mtls-certificate-id"]'
		);
		expect(handler).toContain(
			'setNestedValue(bodyData, ["access_token"], resolveFileToken(argv["token"]'
		);
	});
});
