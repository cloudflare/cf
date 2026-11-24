import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";

// cloudflare/cf#181: `cf schema` is what command help points to "to inspect
// the exact API request", but array request-body fields are listed with the
// type of the yargs flag (`string`) instead of the wire type (`array`).
describe("cf schema request body array fields (cloudflare/cf#181)", () => {
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "Subscriptions", version: "1" },
		paths: {
			"/subscriptions": {
				post: {
					summary: "Create Event Subscription",
					"x-fern-sdk-group-name": "subscriptions",
					"x-fern-sdk-method-name": "create",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										name: { type: "string" },
										events: {
											type: "array",
											description:
												"List of event types this subscription handles",
											items: { type: "string" },
										},
									},
								},
							},
						},
					},
					responses: { "200": { description: "OK" } },
				},
			},
		},
	});
	const schemas = JSON.parse(files.get("_meta/schemas.json") ?? "{}") as {
		schemas: Record<
			string,
			{ requestBodyFields: { name: string; type: string }[] }
		>;
	};
	const field = (name: string) =>
		schemas.schemas["subscriptions create"]?.requestBodyFields.find(
			(f) => f.name === name
		);

	it("lists an array of strings as an array, not a string", () => {
		expect(field("events")).toBeDefined();
		expect(field("events")?.type).toBe("array");
	});

	it("still lists a plain string field as a string", () => {
		expect(field("name")?.type).toBe("string");
	});
});
