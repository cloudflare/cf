import type { ForgeOpenApiDocument } from "./openapi.js";

const updates = [
	["policies", "policy_id", "policy", "Policy"],
	["policy-sets", "policy_set_id", "policy-set", "PolicySet"],
	["workloads", "workload_id", "workload", "Workload"],
	["deployments", "deployment_id", "deployment", "Deployment"],
] as const;

function record(value: unknown): Record<string, unknown> | undefined {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}

/**
 * Require an explicit replacement tag set until Forge carries these CLI-only
 * overrides. Omission clears tags in the API, so it must not be implicit when
 * cf assembles an update from flags. Remove this patch when the pin has them.
 */
export function requireCwsUpdateTags(openapi: ForgeOpenApiDocument): void {
	for (const [resource, id, operationName, schemaName] of updates) {
		const path = `/accounts/{account_id}/cws/${resource}/{${id}}`;
		const operation = openapi.paths?.[path]?.put;
		const schema = record(
			record(openapi.components?.schemas)?.[`cws_Update${schemaName}InputBody`]
		);
		const tags = record(record(schema?.properties)?.tags);
		const body = record(
			record(record(operation?.requestBody)?.content)?.["application/json"]
		);
		if (
			operation?.operationId !== `cws-update-${operationName}` ||
			record(body?.schema)?.["$ref"] !==
				`#/components/schemas/cws_Update${schemaName}InputBody` ||
			tags?.type !== "object" ||
			record(tags.additionalProperties)?.type !== "string"
		) {
			throw new Error(
				`Pinned Forge OpenAPI changed for PUT ${path}; remove or revise the temporary CWS tags CLI compatibility patch`
			);
		}
		if (typeof operation.description === "string") {
			operation.description = operation.description.replace(
				"Omit tags or use {} to clear them.",
				"Provide tags explicitly; use {} to clear them."
			);
		}
		const params = record(operation["x-forge-params"]);
		operation["x-forge-params"] = {
			...params,
			tags: {
				description:
					"Replacement tag set (required). Provide the desired tags, or {} to clear them.",
				...record(params?.tags),
				required: true,
			},
		};
	}
}
