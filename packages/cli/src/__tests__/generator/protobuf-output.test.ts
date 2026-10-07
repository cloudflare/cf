import { describe, expect, it } from "vite-plus/test";
import { buildEmitContext } from "../../../generator/emit/build-context.js";
import { emitHandler } from "../../../generator/emit/handler/index.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

describe("protobuf response emission", () => {
	it("writes profile bytes directly while sending the JSON request body", () => {
		const opInfo = {
			path: "/accounts/{account_id}/workers/workers/{worker_id}/versions/{version_id}/profile",
			method: "post",
			description: "Profile Worker Version",
			pathParams: [
				{ name: "account_id", required: true, type: "string" },
				{ name: "worker_id", required: true, type: "string" },
				{ name: "version_id", required: true, type: "string" },
			],
			queryParams: [],
			headerParams: [],
			bodyParams: [
				{
					name: "duration_ms",
					type: "integer",
					required: true,
					apiFieldPath: ["duration_ms"],
				},
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
			requestBodyRef: null,
			requestBodyRequired: ["duration_ms"],
			requestBodyIsArray: false,
			requestBodyArrayItemRef: null,
			responses: {
				"200": {
					content: {
						"application/vnd.google.protobuf": {
							schema: { type: "string", format: "binary" },
						},
					},
				},
			},
		} as unknown as OperationInfo;
		const { ctx } = buildEmitContext({
			method: {
				name: "profile",
				operationId: "profileWorkerVersion",
				description: "Profile Worker Version",
			} as Schema.method,
			resourceName: "workers",
			groupName: "versions",
			opInfo,
		});

		const handler = emitHandler(ctx).join("\n");
		expect(handler).toContain("fetchRawBytes(");
		expect(handler).toContain("method: 'POST'");
		expect(handler).toContain("body: JSON.stringify(bodyData)");
		expect(handler).toContain(
			"body: Object.keys(bodyData).length > 0 ? bodyData : undefined"
		);
		expect(handler).toContain("contentType: 'application/json'");
		expect(handler).toContain(
			"writeRawOutput(argv.text === true ? __cfRawBytes.toString('utf-8') : __cfRawBytes)"
		);
		expect(handler).not.toContain("formatOutput(");
	});
});
