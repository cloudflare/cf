import operation from "../../../_operations/organizations/logs/audit/get.js";
/**
 * get command
 * @generated from apis/overlays/organizations.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <organization-id>",
	describe: "Get organization audit logs (Version 2)",
	usage:
		"$0 organizations logs audit get <organization-id>\n\nGets a list of audit logs for an organization.",
	flags: {
		"action-result": {
			kind: "parsed",
			brief: "Filters by whether the action was successful or not.",
			variadic: true,
			optional: true,
			choices: ["success", "failure"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"action-type": {
			kind: "parsed",
			brief: "Filters by the action type.",
			variadic: true,
			optional: true,
			choices: ["create", "delete", "view", "update"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"actor-context": {
			kind: "parsed",
			brief:
				"Filters by the actor context.\n- `api`: The action was performed through the API. The specific credential type was not recorded.\n- `api_key`: The action was authenticated with a Cloudflare Global API Key.\n- `api_token`: The action was authenticated with an API token.\n- `dash`: The action was performed through the Cloudflare dashboard.\n- `oauth`: The action was authenticated with an OAuth token.\n- `origin_ca_key`: The action was authenticated with an Origin CA key.",
			variadic: true,
			optional: true,
			choices: [
				"api",
				"api_key",
				"api_token",
				"dash",
				"oauth",
				"origin_ca_key",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"actor-email": {
			kind: "parsed",
			brief: "Filters by the actor's email address.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-id": {
			kind: "parsed",
			brief: "Filters by the actor's user ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-ip-address": {
			kind: "parsed",
			brief: "The IP address where the action was initiated.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-token-id": {
			kind: "parsed",
			brief:
				"Filters by the API token ID when the actor context is an api_token or oauth.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-token-name": {
			kind: "parsed",
			brief:
				"Filters by the API token name when the actor context is an api_token or oauth.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-type": {
			kind: "parsed",
			brief: "Filters by the actor type.",
			variadic: true,
			optional: true,
			choices: ["cloudflare_admin", "system", "user"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		id: {
			kind: "parsed",
			brief: "Finds a specific log by its ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-cf-ray-id": {
			kind: "parsed",
			brief: "Filters by the response CF Ray ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-method": {
			kind: "parsed",
			brief: "The HTTP method for the API call.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-status-code": {
			kind: "parsed",
			brief: "The response status code that was returned.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-uri": {
			kind: "parsed",
			brief: "Filters by the request URI.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-id": {
			kind: "parsed",
			brief: "Filters by the resource ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-product": {
			kind: "parsed",
			brief:
				"Filters audit logs by the Cloudflare product associated with the changed resource.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-type": {
			kind: "parsed",
			brief:
				"Filters audit logs based on the unique type of resource changed by the action.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-scope": {
			kind: "parsed",
			brief:
				"Filters by the resource scope, specifying whether the resource is associated with an organization.",
			variadic: true,
			optional: true,
			choices: ["organizations"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"action-result-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs by whether the action was successful or not.",
			variadic: true,
			optional: true,
			choices: ["success", "failure"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"action-type-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the action type.",
			variadic: true,
			optional: true,
			choices: ["create", "delete", "view", "update"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"actor-context-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs by the actor context.\n- `api`: The action was performed through the API. The specific credential type was not recorded.\n- `api_key`: The action was authenticated with a Cloudflare Global API Key.\n- `api_token`: The action was authenticated with an API token.\n- `dash`: The action was performed through the Cloudflare dashboard.\n- `oauth`: The action was authenticated with an OAuth token.\n- `origin_ca_key`: The action was authenticated with an Origin CA key.",
			variadic: true,
			optional: true,
			choices: [
				"api",
				"api_key",
				"api_token",
				"dash",
				"oauth",
				"origin_ca_key",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"actor-email-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the actor's email address.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-id-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the actor's user ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-ip-address-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs IP address where the action was initiated.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-token-id-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs by the API token ID when the actor context is an api_token or oauth.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-token-name-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs by the API token name when the actor context is an api_token or oauth.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"actor-type-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the actor type.",
			variadic: true,
			optional: true,
			choices: ["cloudflare_admin", "system", "user"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"id-not": {
			kind: "parsed",
			brief: "Filters out audit logs by their IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-cf-ray-id-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the response CF Ray ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-method-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the HTTP method for the API call.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-status-code-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs by the response status code that was returned.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"raw-uri-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the request URI.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-id-not": {
			kind: "parsed",
			brief: "Filters out audit logs by the resource ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-product-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs by the Cloudflare product associated with the changed resource.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-type-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs based on the unique type of resource changed by the action.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-scope-not": {
			kind: "parsed",
			brief:
				"Filters out audit logs by the resource scope, specifying whether the resource is associated with an organization.",
			variadic: true,
			optional: true,
			choices: ["organizations"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		since: {
			kind: "parsed",
			brief:
				"Limits the returned results to logs newer than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			parse: String,
		},
		before: {
			kind: "parsed",
			brief:
				"Limits the returned results to logs older than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Sets sorting order.",
			values: ["desc", "asc"],
			optional: true,
		},
		limit: {
			kind: "parsed",
			brief:
				"The number limits the objects to return. The cursor attribute may be used to iterate over the next batch of objects if there are more than the limit.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"The cursor is an opaque token used to paginate through large sets of records. It indicates the position from which to continue when requesting the next set of records. A valid cursor value can be obtained from the cursor object in the result_info structure of a previous response.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "organization-id",
			brief: "The unique id that identifies the organization.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
		),
});

export default command;
