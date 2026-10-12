import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts logs audit list\n\nGets a list of audit logs for an account."
		)
		.option("account-name", {
			type: "string",
			description: "Filters by the account name.",
		})
		.option("action-result", {
			type: "string",
			description: "Filters by whether the action was successful or not.",
		})
		.option("action-type", {
			type: "string",
			description: "Filters by the action type.",
		})
		.option("actor-context", {
			type: "string",
			description:
				"Filters by the actor context.\n- `api`: The action was performed through the API. The specific credential type was not recorded.\n- `api_key`: The action was authenticated with a Cloudflare Global API Key.\n- `api_token`: The action was authenticated with an API token.\n- `dash`: The action was performed through the Cloudflare dashboard.\n- `oauth`: The action was authenticated with an OAuth token.\n- `origin_ca_key`: The action was authenticated with an Origin CA key.",
		})
		.option("actor-email", {
			type: "string",
			description: "Filters by the actor's email address.",
		})
		.option("actor-id", {
			type: "string",
			description:
				"Filters by the actor ID. This can be either the Account ID or User ID.",
		})
		.option("actor-ip-address", {
			type: "string",
			description: "The IP address where the action was initiated.",
		})
		.option("actor-token-id", {
			type: "string",
			description:
				"Filters by the API token ID when the actor context is an api_token or oauth.",
		})
		.option("actor-token-name", {
			type: "string",
			description:
				"Filters by the API token name when the actor context is an api_token or oauth.",
		})
		.option("actor-type", {
			type: "string",
			description: "Filters by the actor type.",
		})
		.option("audit-log-id", {
			type: "string",
			description: "Finds a specific log by its ID.",
		})
		.option("id", {
			type: "string",
			description: "Finds a specific log by its ID.",
		})
		.option("raw-cf-ray-id", {
			type: "string",
			description: "Filters by the response CF Ray ID.",
		})
		.option("raw-method", {
			type: "string",
			description: "The HTTP method for the API call.",
		})
		.option("raw-status-code", {
			type: "string",
			description: "The response status code that was returned.",
		})
		.option("raw-uri", {
			type: "string",
			description: "Filters by the request URI.",
		})
		.option("resource-id", {
			type: "string",
			description: "Filters by the resource ID.",
		})
		.option("resource-product", {
			type: "string",
			description:
				"Filters audit logs by the Cloudflare product associated with the changed resource.",
		})
		.option("resource-type", {
			type: "string",
			description:
				"Filters audit logs based on the unique type of resource changed by the action.",
		})
		.option("resource-scope", {
			type: "string",
			description:
				"Filters by the resource scope, specifying whether the resource is associated with an user, an account, a zone, or a membership.",
		})
		.option("product-category", {
			type: "string",
			description:
				"Filters audit logs by one or more predefined product categories. Each product category expands into a curated set of resource_product values and is unioned with any explicit resource_product filter. Matched case-insensitively; unknown product categories return 400. Repeatable. Use the audit log product categories endpoint to discover the available values.",
		})
		.option("zone-id", {
			type: "string",
			description: "Filters by the zone ID.",
		})
		.option("zone-name", {
			type: "string",
			description: "Filters by the zone name associated with the change.",
		})
		.option("account-name-not", {
			type: "string",
			description: "Filters out audit logs by the account name.",
		})
		.option("action-result-not", {
			type: "string",
			description:
				"Filters out audit logs by whether the action was successful or not.",
		})
		.option("action-type-not", {
			type: "string",
			description: "Filters out audit logs by the action type.",
		})
		.option("actor-context-not", {
			type: "string",
			description:
				"Filters out audit logs by the actor context.\n- `api`: The action was performed through the API. The specific credential type was not recorded.\n- `api_key`: The action was authenticated with a Cloudflare Global API Key.\n- `api_token`: The action was authenticated with an API token.\n- `dash`: The action was performed through the Cloudflare dashboard.\n- `oauth`: The action was authenticated with an OAuth token.\n- `origin_ca_key`: The action was authenticated with an Origin CA key.",
		})
		.option("actor-email-not", {
			type: "string",
			description: "Filters out audit logs by the actor's email address.",
		})
		.option("actor-id-not", {
			type: "string",
			description:
				"Filters out audit logs by the actor ID. This can be either the Account ID or User ID.",
		})
		.option("actor-ip-address-not", {
			type: "string",
			description:
				"Filters out audit logs IP address where the action was initiated.",
		})
		.option("actor-token-id-not", {
			type: "string",
			description:
				"Filters out audit logs by the API token ID when the actor context is an api_token or oauth.",
		})
		.option("actor-token-name-not", {
			type: "string",
			description:
				"Filters out audit logs by the API token name when the actor context is an api_token or oauth.",
		})
		.option("actor-type-not", {
			type: "string",
			description: "Filters out audit logs by the actor type.",
		})
		.option("audit-log-id-not", {
			type: "string",
			description: "Filters out audit logs by their IDs.",
		})
		.option("id-not", {
			type: "string",
			description: "Filters out audit logs by their IDs.",
		})
		.option("raw-cf-ray-id-not", {
			type: "string",
			description: "Filters out audit logs by the response CF Ray ID.",
		})
		.option("raw-method-not", {
			type: "string",
			description:
				"Filters out audit logs by the HTTP method for the API call.",
		})
		.option("raw-status-code-not", {
			type: "string",
			description:
				"Filters out audit logs by the response status code that was returned.",
		})
		.option("raw-uri-not", {
			type: "string",
			description: "Filters out audit logs by the request URI.",
		})
		.option("resource-id-not", {
			type: "string",
			description: "Filters out audit logs by the resource ID.",
		})
		.option("resource-product-not", {
			type: "string",
			description:
				"Filters out audit logs by the Cloudflare product associated with the changed resource.",
		})
		.option("resource-type-not", {
			type: "string",
			description:
				"Filters out audit logs based on the unique type of resource changed by the action.",
		})
		.option("resource-scope-not", {
			type: "string",
			description:
				"Filters out audit logs by the resource scope, specifying whether the resource is associated with an user, an account, a zone, or a membership.",
		})
		.option("zone-id-not", {
			type: "string",
			description: "Filters out audit logs by the zone ID.",
		})
		.option("zone-name-not", {
			type: "string",
			description:
				"Filters out audit logs by the zone name associated with the change.",
		})
		.option("since", {
			type: "string",
			description:
				"Limits the returned results to logs newer than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			demandOption: true,
		})
		.option("before", {
			type: "string",
			description:
				"Limits the returned results to logs older than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			demandOption: true,
		})
		.option("direction", {
			type: "string",
			description: "Sets sorting order.",
			choices: ["desc", "asc"],
		})
		.option("limit", {
			type: "number",
			description:
				"The number limits the objects to return. The cursor attribute may be used to iterate over the next batch of objects if there are more than the limit.",
		})
		.option("cursor", {
			type: "string",
			description:
				"The cursor is an opaque token used to paginate through large sets of records. It indicates the position from which to continue when requesting the next set of records. A valid cursor value can be obtained from the cursor object in the result_info structure of a previous response.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"audit-logs-v2-get-account-audit-logs">;
type Query = SdkQuery<"audit-logs-v2-get-account-audit-logs">;

const typedBuilder = withArgTypes<
	{
		"action-result": Query["action_result"];
		"action-type": Query["action_type"];
		"actor-context": Query["actor_context"];
		"actor-type": Query["actor_type"];
		"raw-status-code": Query["raw_status_code"];
		"resource-scope": Query["resource_scope"];
		"action-result-not": Query["action_result.not"];
		"action-type-not": Query["action_type.not"];
		"actor-context-not": Query["actor_context.not"];
		"actor-type-not": Query["actor_type.not"];
		"raw-status-code-not": Query["raw_status_code.not"];
		"resource-scope-not": Query["resource_scope.not"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Get account audit logs (Version 2)",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts logs audit list",
				classification: {
					safeFlags: ["direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					account_name: argv["account-name"],
					action_result: argv["action-result"],
					action_type: argv["action-type"],
					actor_context: argv["actor-context"],
					actor_email: argv["actor-email"],
					actor_id: argv["actor-id"],
					actor_ip_address: argv["actor-ip-address"],
					actor_token_id: argv["actor-token-id"],
					actor_token_name: argv["actor-token-name"],
					actor_type: argv["actor-type"],
					audit_log_id: argv["audit-log-id"],
					id: argv["id"],
					raw_cf_ray_id: argv["raw-cf-ray-id"],
					raw_method: argv["raw-method"],
					raw_status_code: argv["raw-status-code"],
					raw_uri: argv["raw-uri"],
					resource_id: argv["resource-id"],
					resource_product: argv["resource-product"],
					resource_type: argv["resource-type"],
					resource_scope: argv["resource-scope"],
					product_category: argv["product-category"],
					zone_id: argv["zone-id"],
					zone_name: argv["zone-name"],
					"account_name.not": argv["account-name-not"],
					"action_result.not": argv["action-result-not"],
					"action_type.not": argv["action-type-not"],
					"actor_context.not": argv["actor-context-not"],
					"actor_email.not": argv["actor-email-not"],
					"actor_id.not": argv["actor-id-not"],
					"actor_ip_address.not": argv["actor-ip-address-not"],
					"actor_token_id.not": argv["actor-token-id-not"],
					"actor_token_name.not": argv["actor-token-name-not"],
					"actor_type.not": argv["actor-type-not"],
					"audit_log_id.not": argv["audit-log-id-not"],
					"id.not": argv["id-not"],
					"raw_cf_ray_id.not": argv["raw-cf-ray-id-not"],
					"raw_method.not": argv["raw-method-not"],
					"raw_status_code.not": argv["raw-status-code-not"],
					"raw_uri.not": argv["raw-uri-not"],
					"resource_id.not": argv["resource-id-not"],
					"resource_product.not": argv["resource-product-not"],
					"resource_type.not": argv["resource-type-not"],
					"resource_scope.not": argv["resource-scope-not"],
					"zone_id.not": argv["zone-id-not"],
					"zone_name.not": argv["zone-name-not"],
					since: argv["since"],
					before: argv["before"],
					direction: argv["direction"],
					limit: argv["limit"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts logs audit list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/logs/audit`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.accounts.logs.audit.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
