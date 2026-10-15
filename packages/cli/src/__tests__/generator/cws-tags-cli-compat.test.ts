import { describe, expect, it } from "vite-plus/test";
import { requireCwsUpdateTags } from "../../../generator/cws-tags-cli-compat.js";
import type { ForgeOpenApiDocument } from "../../../generator/openapi.js";

function source(): ForgeOpenApiDocument {
	const paths: NonNullable<ForgeOpenApiDocument["paths"]> = {};
	const schemas: Record<string, unknown> = {};
	for (const [resource, id, name, schema] of [
		["policies", "policy_id", "policy", "Policy"],
		["policy-sets", "policy_set_id", "policy-set", "PolicySet"],
		["workloads", "workload_id", "workload", "Workload"],
		["deployments", "deployment_id", "deployment", "Deployment"],
	]) {
		paths[`/accounts/{account_id}/cws/${resource}/{${id}}`] = {
			put: {
				operationId: `cws-update-${name}`,
				requestBody: {
					content: {
						"application/json": {
							schema: {
								$ref: `#/components/schemas/cws_Update${schema}InputBody`,
							},
						},
					},
				},
				"x-forge-params": {
					name: { description: "Keep me" },
					tags: { description: "Tag choice" },
				},
			},
		};
		schemas[`cws_Update${schema}InputBody`] = {
			type: "object",
			properties: {
				tags: { type: "object", additionalProperties: { type: "string" } },
			},
		};
	}
	return { paths, components: { schemas } };
}

describe("CWS update tag choice", () => {
	it("requires tags on all four updates without replacing other CLI overrides", () => {
		const document = source();
		requireCwsUpdateTags(document);
		for (const path of Object.values(document.paths ?? {})) {
			expect(path?.put?.["x-forge-params"]).toEqual({
				name: { description: "Keep me" },
				tags: { description: "Tag choice", required: true },
			});
		}
	});

	it("fails generation when the pinned operations change", () => {
		const document = source();
		delete document.paths?.["/accounts/{account_id}/cws/policies/{policy_id}"];
		expect(() => requireCwsUpdateTags(document)).toThrow(
			"Pinned Forge OpenAPI changed"
		);
	});
});
