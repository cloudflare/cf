import { describe, expect, it } from "vitest";
import { generateBuilderLines } from "../../../generator/emit/builder.js";
import { emitDryRun } from "../../../generator/emit/handler/dry-run.js";
import type { EmitContext } from "../../../generator/emit/context.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

describe("mixed-content dry-run emission", () => {
	it("uses sensitive body paths for both flags and --body previews", () => {
		const opInfo = {
			method: "put",
			path: "/secrets",
			requestContentTypes: ["application/json"],
			bodyParams: [{ sensitive: true, apiFieldPath: ["credentials", "token"] }],
		} as OperationInfo;
		const derived = {
			args: [],
			optionalParentGroups: [],
			isMutating: true,
			hasBody: true,
			hasEmptyBody: false,
			hasBodyParams: false,
			hasFileUpload: false,
			multipartInfo: undefined,
			multipartFlagFields: [],
		};
		const ctx = {
			method: { name: "update" },
			opInfo,
			derived,
			allPathParamNames: [],
			needsAccountId: false,
			needsWorkerName: false,
			hasAccountOrZoneScope: false,
			hasParams: false,
			resourceName: "secrets",
			groupName: undefined,
		} as unknown as EmitContext;

		expect(emitDryRun(ctx).join("\n")).toContain(
			'sensitiveBodyPaths: [["credentials","token"]], showSecrets: argv.showSecrets'
		);
		expect(
			generateBuilderLines(
				{ name: "update" } as Schema.method,
				"secrets",
				opInfo,
				"json",
				derived as EmitContext["derived"]
			).join("\n")
		).toContain('.option("show-secrets"');
	});

	it("previews the file selected by the live handler before a JSON body", () => {
		const ctx = {
			method: { name: "upload" },
			opInfo: {
				method: "patch",
				path: "/uploads",
				requestContentTypes: [
					"application/json",
					"application/merge-patch+json",
				],
			},
			derived: {
				args: [],
				isMutating: true,
				hasBody: true,
				hasBodyParams: false,
				hasFileUpload: true,
				multipartInfo: undefined,
				multipartFlagFields: [],
			},
			allPathParamNames: [],
			needsAccountId: false,
			needsWorkerName: false,
			hasAccountOrZoneScope: false,
			hasParams: false,
			resourceName: "uploads",
			groupName: undefined,
		} as unknown as EmitContext;

		const output = emitDryRun(ctx).join("\n");
		expect(output).toContain(
			"bodyKind: argv.file !== undefined ? 'octet-stream' : 'json'"
		);
		expect(output).toContain(
			"body: argv.file !== undefined\n            ? { file: argv.file }\n            : argv.body !== undefined\n            ? parseBody(argv.body)"
		);
	});
});
