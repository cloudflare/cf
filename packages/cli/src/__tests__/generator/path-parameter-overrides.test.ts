import { describe, expect, it, vi } from "vite-plus/test";
import { buildEmitContext } from "../../../generator/emit/build-context.js";
import { generateBuilderLines } from "../../../generator/emit/builder.js";
import { generateCommandFile } from "../../../generator/generator.js";
import type * as Forge from "@cloudflare/forge";
import type { OperationInfo, Schema } from "@cloudflare/forge";

vi.mock("@cloudflare/forge", async (importOriginal) => ({
	...(await importOriginal<typeof Forge>()),
	resolveOperation: vi.fn(),
}));

import { resolveOperation } from "@cloudflare/forge";

const op = {
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances",
	method: "post",
	description: "Create an instance",
	pathParams: [
		{ name: "account_id", required: true, type: "string" },
		{ name: "name", sdkName: "namespace", required: true, type: "string" },
	],
	queryParams: [],
	headerParams: [],
	bodyParams: [
		{
			name: "id",
			type: "string",
			required: true,
			description: "Instance ID",
			apiFieldPath: ["id"],
		},
	],
	hasRequestBody: true,
	requestContentTypes: ["application/json"],
	requestBodyRef: null,
	requestBodyRequired: ["id"],
	requestBodyIsArray: false,
	requestBodyArrayItemRef: null,
	responses: { "200": { content: { "application/json": {} } } },
} as unknown as OperationInfo;

// The pinned spec no longer supplies a namespace default. This fixture
// exercises the annotation from the report independently of upstream changes.
const method = {
	name: "create",
	status: "generally-available",
	operationId: "ai-search-namespace-create-instance",
	description: "Create an instance",
	params: { name: { default: "default" }, id: { positional: true } },
} as Schema.method;

describe("path parameter overrides in generated commands", () => {
	it("registers a defaulted namespace flag beside the sole instance positional", () => {
		const { ctx, commandStr } = buildEmitContext({
			method,
			resourceName: "ai-search",
			groupName: undefined,
			opInfo: op,
		});
		const lines = generateBuilderLines(
			method,
			"ai-search",
			op,
			ctx.outputKind,
			ctx.derived
		);
		const namespaceLine = lines.find((line) =>
			line.startsWith(".option('namespace',")
		);
		expect(namespaceLine).toBeDefined();
		const json = namespaceLine?.slice(".option('namespace', ".length, -1) ?? "";
		expect(JSON.parse(json)).toEqual({
			type: "string",
			description: "Name",
			default: "default",
		});
		expect(commandStr).toBe("create <id>");
		expect(lines.join("\n")).not.toContain(".positional('namespace'");
	});

	it("keeps the default and positional placement consistent with metadata, requests, and previews", () => {
		vi.mocked(resolveOperation).mockReturnValue(op);
		const { code, meta } = generateCommandFile(method, "ai-search");
		expect(meta.arguments.map((arg) => arg.name)).toEqual(["id"]);
		expect(meta.options).toContainEqual(
			expect.objectContaining({
				name: "namespace",
				required: false,
				default: "default",
			})
		);
		expect(meta.usage).toBe("cf ai-search create <id> [options]");
		expect(code).toContain('namespace: argv["namespace"]');
		expect(code).toContain('encodeURIComponent(String(argv["namespace"]))');
		expect(code).not.toContain('bodyData["namespace"]');
	});
});
