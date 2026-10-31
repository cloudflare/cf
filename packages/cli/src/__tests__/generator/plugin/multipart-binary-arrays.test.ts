import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";

type Json = Record<string, unknown>;

/**
 * A document with `paths`, and the schemas `schemas`.
 */
function doc(paths: Json, schemas: Json = {}) {
	return {
		openapi: "3.0.3",
		info: { title: "t", version: "1" },
		paths,
		components: { schemas },
	};
}

/** A JSON `200` response. */
const ok = () => ({
	"200": {
		description: "OK",
		content: { "application/json": { schema: { type: "object" } } },
	},
});

/**
 * A `things.create` POST whose multipart body takes `files`: an array of
 * `format: binary` strings, as the Workers AI to-markdown endpoint declares
 * it (#463). Such a field is a file field, not an ordinary array flag.
 */
function uploadFiles() {
	return doc({
		"/accounts/{account_id}/things": {
			post: {
				"x-fern-sdk-group-name": "things",
				"x-fern-sdk-method-name": "create",
				summary: "Create things",
				parameters: [
					{
						name: "account_id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["files"],
								properties: {
									files: {
										type: "array",
										description:
											"Files to convert, supplied as multipart file uploads.",
										items: { type: "string", format: "binary" },
									},
								},
							},
						},
					},
				},
				responses: ok(),
			},
		},
	});
}

describe("multipart arrays of binary items", () => {
	it("uploads each item of a binary array as a files file part", () => {
		const files = generateFiles(uploadFiles());
		const code = files.get("things/create.ts") ?? "";
		expect(code).toMatch(
			/formData\.append\(\s*(['"])files\1\s*,\s*new Blob\(/
		);
	});
});
