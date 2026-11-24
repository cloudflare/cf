import operation from "../../../_operations/organizations/logs/audit/get.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "organizations logs audit get",
			classification: {
				safeFlags: ["direction", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				action_result: argv["action-result"],
				action_type: argv["action-type"],
				actor_context: argv["actor-context"],
				actor_email: argv["actor-email"],
				actor_id: argv["actor-id"],
				actor_ip_address: argv["actor-ip-address"],
				actor_token_id: argv["actor-token-id"],
				actor_token_name: argv["actor-token-name"],
				actor_type: argv["actor-type"],
				id: argv["id"],
				raw_cf_ray_id: argv["raw-cf-ray-id"],
				raw_method: argv["raw-method"],
				raw_status_code: argv["raw-status-code"],
				raw_uri: argv["raw-uri"],
				resource_id: argv["resource-id"],
				resource_product: argv["resource-product"],
				resource_type: argv["resource-type"],
				resource_scope: argv["resource-scope"],
				"action_result.not": argv["action-result-not"],
				"action_type.not": argv["action-type-not"],
				"actor_context.not": argv["actor-context-not"],
				"actor_email.not": argv["actor-email-not"],
				"actor_id.not": argv["actor-id-not"],
				"actor_ip_address.not": argv["actor-ip-address-not"],
				"actor_token_id.not": argv["actor-token-id-not"],
				"actor_token_name.not": argv["actor-token-name-not"],
				"actor_type.not": argv["actor-type-not"],
				"id.not": argv["id-not"],
				"raw_cf_ray_id.not": argv["raw-cf-ray-id-not"],
				"raw_method.not": argv["raw-method-not"],
				"raw_status_code.not": argv["raw-status-code-not"],
				"raw_uri.not": argv["raw-uri-not"],
				"resource_id.not": argv["resource-id-not"],
				"resource_product.not": argv["resource-product-not"],
				"resource_type.not": argv["resource-type-not"],
				"resource_scope.not": argv["resource-scope-not"],
				since: argv["since"],
				before: argv["before"],
				direction: argv["direction"],
				limit: argv["limit"],
				cursor: argv["cursor"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf organizations logs audit get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/logs/audit`,
					pathParams: {
						"organization-id": String(argv["organization-id"] ?? ""),
					},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					organization_id: argv["organization-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
