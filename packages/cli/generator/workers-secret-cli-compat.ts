import type { ForgeOpenApiDocument } from "@cloudflare/forge";

/**
 * Preserve the released `workers secrets update <name>` CLI shape after the
 * operation became part of the cf-cli audience. The OpenAPI update that made
 * it visible accidentally dropped the body-parameter override that promotes
 * `name` to a required positional.
 *
 * Remove this compatibility patch after the pinned Forge OpenAPI restores the
 * `x-forge-params.name` annotation. Keep the source-shape checks so a new pin
 * fails generation instead of silently applying this patch to a changed
 * operation.
 */
export function preserveWorkersSecretUpdatePositional(
	openapi: ForgeOpenApiDocument
): void {
	const path = "/accounts/{account_id}/workers/scripts/{script_name}/secrets";
	const operation = openapi.paths?.[path]?.put;
	if (
		operation?.operationId !== "worker-put-script-secret" ||
		operation["x-forge-hidden"] !== undefined ||
		JSON.stringify(operation["x-fern-sdk-group-name"]) !==
			'["workers","secrets"]' ||
		operation["x-fern-sdk-method-name"] !== "update" ||
		operation["x-forge-params"] !== undefined
	) {
		throw new Error(
			`Pinned Forge OpenAPI changed for PUT ${path}; remove or revise the temporary Worker secret CLI compatibility patch`
		);
	}

	operation["x-forge-params"] = {
		name: { positional: true, required: true },
	};
}
