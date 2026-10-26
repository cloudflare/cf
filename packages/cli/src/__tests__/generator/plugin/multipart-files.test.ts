import { describe, expect, it } from "vite-plus/test";
import { derive } from "../../../../generator/plugin/args.js";
import { dryRun, handler } from "../../../../generator/plugin/emit/handler.js";
import { context, method, operation, param } from "../../helpers/cli-plugin.js";
import type {
	MultipartField,
	OperationInfo,
} from "../../../../generator/plugin/operation.js";

const upload = method("upload", "example-upload");
const binary = (name: string): MultipartField => ({
	name,
	type: "string",
	isBinary: true,
	description: `${name} file`,
});
const multipartOperation = (fields: MultipartField[]): OperationInfo =>
	operation("post", "/accounts/{account_id}/example", {
		hasRequestBody: true,
		requestContentTypes: ["multipart/form-data"],
		multipart: { fields, payloadField: "_headers" },
	});

describe("binary multipart file flags", () => {
	it("gives every binary field after the payload its own flag", () => {
		const op = multipartOperation([
			binary("_headers"),
			binary("_worker.js"),
			binary("_routes.json"),
			binary("file"),
			binary("__"),
			{
				name: "branch",
				type: "string",
				isBinary: false,
				description: "Branch",
			},
		]);
		const d = derive(upload, "example", op);
		expect(
			d.multipartFileFields.map(({ field, flag }) => [field.name, flag])
		).toEqual([
			["_worker.js", "worker-js"],
			["_routes.json", "routes-json"],
		]);
		expect(d.multipartFlagFields.map((field) => field.name)).toEqual([
			"branch",
		]);
	});

	it("avoids globals, aliases, existing arguments, and duplicate normalized names", () => {
		const op = multipartOperation([
			{ name: "label", type: "string", isBinary: false, description: "Label" },
			...[
				"_body",
				"_file",
				"_force",
				"_f",
				"_quiet",
				"_q",
				"_zone",
				"_z",
				"_profile",
				"_mode",
				"_temporary.account",
				"_event.code",
				"_m",
				"_help",
				"_h",
				"_version",
				"_v",
				"_text",
				"_local",
				"_dry.run",
				"_persist.to",
				"_query",
				"_label",
				"_worker.js",
				"worker_js",
				".routes.json",
				"__",
				"-invalid",
				"has space",
				"has'quote",
			].map(binary),
		]);
		op.queryParams = [param("q", "query")];
		const d = derive(upload, "example", op);
		expect(
			d.multipartFileFields.map(({ field, flag }) => [field.name, flag])
		).toEqual([
			["_worker.js", "worker-js"],
			[".routes.json", "routes-json"],
		]);
	});

	it("does not shadow the worker script-name alias", () => {
		const op = multipartOperation([binary("_script.name")]);
		op.path = "/accounts/{account_id}/workers/scripts/{script_name}";
		op.pathParams = [param("script_name")];
		expect(derive(upload, "workers", op).multipartFileFields).toEqual([]);
	});

	it("selects multipart for a binary flag when octet-stream is also accepted", () => {
		const op = multipartOperation([binary("source")]);
		op.requestContentTypes = [
			"application/octet-stream",
			"multipart/form-data",
		];
		const ctx = context(upload, "example", op);
		expect(handler(ctx).join("\n")).toContain(
			'if (argv["source"] !== undefined) {'
		);
		expect(dryRun(ctx).join("\n")).toContain(
			"bodyKind: argv[\"source\"] !== undefined ? 'multipart' : 'octet-stream'"
		);
	});
});
