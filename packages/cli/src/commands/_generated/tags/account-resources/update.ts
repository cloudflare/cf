/**
 * update command
 * @generated from apis/overlays/tags.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"if-match": {
			kind: "parsed",
			brief:
				"ETag value for optimistic concurrency control. When provided, the server will\nverify the current resource ETag matches before applying the write. Returns\n412 Precondition Failed if the resource has been modified since the ETag was\nobtained. Omit this header for unconditional writes.",
			optional: true,
			parse: String,
		},
		"resource-id": {
			kind: "parsed",
			brief: "Identifies the unique resource.",
			optional: true,
			parse: String,
		},
		"resource-type": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- `worker_version`: Enum for worker_version resource type.\n- `access_application`, `access_group`, `access_service_token`, `account`, `account_ruleset`, `ai_gateway`, `ai_search_instance`, `ai_search_namespace`, `alerting_policy`, `alerting_webhook`, `app_library_application`, `cloudflared_tunnel`, `cws_deployment`, `cws_policy`, `cws_policy_set`, `cws_workload`, `d1_database`, `device`, `durable_object_namespace`, `gateway_list`, `gateway_rule`, `image`, `infrastructure_target`, `kv_namespace`, `load_balancer_monitor`, `load_balancer_pool`, `namespace_worker`, `pages_project`, `queue`, `r2_bucket`, `resource_share`, `stream_live_input`, `stream_video`, `vectorize_index`, `worker`: Enum for base account-level resource types (those with no extra required fields).",
			optional: true,
			choices: [
				"worker_version",
				"access_application",
				"access_group",
				"access_service_token",
				"account",
				"account_ruleset",
				"ai_gateway",
				"ai_search_instance",
				"ai_search_namespace",
				"alerting_policy",
				"alerting_webhook",
				"app_library_application",
				"cloudflared_tunnel",
				"cws_deployment",
				"cws_policy",
				"cws_policy_set",
				"cws_workload",
				"d1_database",
				"device",
				"durable_object_namespace",
				"gateway_list",
				"gateway_rule",
				"image",
				"infrastructure_target",
				"kv_namespace",
				"load_balancer_monitor",
				"load_balancer_pool",
				"namespace_worker",
				"pages_project",
				"queue",
				"r2_bucket",
				"resource_share",
				"stream_live_input",
				"stream_video",
				"vectorize_index",
				"worker",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "resource-type", "text"),
		},
		"worker-id": {
			kind: "parsed",
			brief: "Worker ID is required only for worker_version resources",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body schema for setting tags on account-level resources.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Set tags for an account or zone-level resource",
	usage:
		"$0 tags account-resources update\n\nCreates or updates tags for a specific account or zone-level resource. Replaces all existing tags for the resource.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
