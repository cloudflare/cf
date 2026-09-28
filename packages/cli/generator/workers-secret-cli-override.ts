import type { ForgeOpenApiDocument } from "@cloudflare/forge";

/**
 * Remove this override after the pinned Forge OpenAPI includes these operations
 * in the cf-cli audience. Keep the source-shape checks so a new pin fails
 * generation rather than silently applying this patch to changed operations.
 */
export function forceEnableWorkersSecrets(openapi: ForgeOpenApiDocument): void {
	const operations = [
		{
			path: "/accounts/{account_id}/workers/scripts/{script_name}/secrets",
			method: "put",
			operationId: "worker-put-script-secret",
			methodName: "update",
		},
		{
			path: "/accounts/{account_id}/workers/scripts/{script_name}/secrets-bulk",
			method: "patch",
			operationId: "worker-patch-script-secrets-bulk",
			methodName: "bulk-edit",
		},
	] as const;

	for (const { path, method, operationId, methodName } of operations) {
		const operation = openapi.paths?.[path]?.[method];
		if (
			operation?.operationId !== operationId ||
			JSON.stringify(operation["x-fern-audiences"]) !== '["sdk"]' ||
			operation["x-forge-hidden"] !== true ||
			JSON.stringify(operation["x-fern-sdk-group-name"]) !==
				'["workers","secrets"]' ||
			operation["x-fern-sdk-method-name"] !== methodName
		) {
			throw new Error(
				`Pinned Forge OpenAPI changed for ${method.toUpperCase()} ${path}; remove or revise the temporary Worker secret CLI override`
			);
		}

		operation["x-fern-audiences"] = ["sdk", "cf-cli"];
		operation["x-forge-hidden"] = false;
		if (method === "patch") {
			operation["x-fern-sdk-method-name"] = "bulk";
		}
	}
}
