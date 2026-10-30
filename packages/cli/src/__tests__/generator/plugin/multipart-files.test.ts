import { describe, expect, it } from "vite-plus/test";
import { derive } from "../../../../generator/plugin/args.js";
import { builderLines } from "../../../../generator/plugin/emit/builder.js";
import { dryRun, handler } from "../../../../generator/plugin/emit/handler.js";
import {
	bodyParam,
	context,
	method,
	operation,
	param,
} from "../../helpers/cli-plugin.js";
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
		expect(d.multipartFlagFields.map(({ field }) => field.name)).toEqual([
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

describe("multipart field flag names", () => {
	const text = (name: string): MultipartField => ({
		name,
		type: "string",
		isBinary: false,
		description: `${name} text`,
	});
	const renaming = (params: Record<string, { flagName: string }>) =>
		method("upload", "example-upload", { params });

	it("fills a form field from its flagName", () => {
		const op = multipartOperation([binary("_headers"), text("label")]);
		const ctx = context(
			renaming({ label: { flagName: "form-label" } }),
			"example",
			op
		);
		expect(builderLines(ctx).join("\n")).toContain(".option('form-label', {");
		const code = handler(ctx).join("\n");
		expect(code).toContain(
			"if (argv[\"form-label\"] !== undefined) formData.append('label'"
		);
		expect(code).not.toContain('argv["label"]');
	});

	it("shares one flag between a form field and its renamed JSON twin", () => {
		const op = multipartOperation([binary("_headers"), text("label")]);
		op.requestContentTypes = ["application/json", "multipart/form-data"];
		op.bodyParams = [bodyParam("label", "string", ["label"])];
		const ctx = context(
			renaming({ label: { flagName: "display-label" } }),
			"example",
			op
		);
		const builder = builderLines(ctx).join("\n");
		expect(builder.match(/\.option\('display-label'/g)).toHaveLength(1);
		expect(builder).not.toContain("'label'");
		expect(handler(ctx).join("\n")).toContain(
			"if (argv[\"display-label\"] !== undefined) formData.append('label'"
		);
	});

	it("names a binary field's flag from its flagName", () => {
		const op = multipartOperation([binary("_headers"), binary("_worker.js")]);
		const d = derive(
			renaming({ "_worker.js": { flagName: "worker-script" } }),
			"example",
			op
		);
		expect(
			d.multipartFileFields.map(({ field, flag }) => [field.name, flag])
		).toEqual([["_worker.js", "worker-script"]]);
	});
});
