/** Per-alias `x-forge-params` (issue #621). */
import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";

function doc() {
	return {
		openapi: "3.0.3",
		info: { title: "t", version: "1" },
		paths: {
			"/accounts/{account_id}/things/{id}/status": {
				patch: {
					operationId: "things-status",
					summary: "Change status",
					parameters: [
						{ name: "account_id", in: "path", required: true, schema: { type: "string" } },
						{ name: "id", in: "path", required: true, schema: { type: "string" } },
					],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["status"],
									properties: {
										status: { type: "string", enum: ["pause", "resume"] },
										rollback: { type: "boolean" },
									},
								},
							},
						},
					},
					responses: {
						"200": {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "resume",
					"x-forge-aliases": [
						{
							"x-fern-sdk-group-name": "things",
							"x-fern-sdk-method-name": "pause",
							"x-forge-params": {
								rollback: { hidden: true },
								status: { default: "pause", hidden: true },
							},
						},
					],
				},
			},
		},
		components: { schemas: {} },
	};
}

describe("alias x-forge-params", () => {
	it("applies the alias's own params to its command", () => {
		const files = generateFiles(doc());
		const code = files.get("things/pause.ts");
		if (code === undefined) {
			throw new Error(`no things/pause.ts in ${[...files.keys()].join(", ")}`);
		}
		expect(code).not.toContain("promptForRequiredEnumField");
		expect(code).not.toContain(`.option('status'`);
		expect(code).not.toContain(`.option('rollback'`);
		expect(code).toContain("pause");
	});
});
