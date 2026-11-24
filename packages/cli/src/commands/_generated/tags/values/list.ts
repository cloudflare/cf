/**
 * list command
 * @generated from apis/overlays/tags.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tag-key": {
			kind: "parsed",
			brief: "The tag key to retrieve values for.",
			parse: String,
		},
		type: {
			kind: "enum",
			brief: "Filter by resource type.",
			values: [
				"access_application",
				"access_application_policy",
				"access_group",
				"access_service_token",
				"account",
				"account_ruleset",
				"ai_gateway",
				"ai_search_instance",
				"ai_search_namespace",
				"alerting_policy",
				"alerting_webhook",
				"api_gateway_operation",
				"app_library_application",
				"cloudflared_tunnel",
				"custom_certificate",
				"custom_hostname",
				"cws_deployment",
				"cws_policy",
				"cws_policy_set",
				"cws_workload",
				"d1_database",
				"device",
				"dns_record",
				"durable_object_namespace",
				"gateway_list",
				"gateway_rule",
				"healthcheck",
				"image",
				"infrastructure_target",
				"kv_namespace",
				"load_balancer",
				"load_balancer_monitor",
				"load_balancer_pool",
				"managed_client_certificate",
				"namespace_worker",
				"pages_project",
				"queue",
				"r2_bucket",
				"resource_share",
				"stream_live_input",
				"stream_video",
				"vectorize_index",
				"worker",
				"worker_route",
				"worker_version",
				"zone",
				"zone_ruleset",
			],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief: "Cursor for pagination.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List tag values",
	usage:
		"$0 tags values list\n\nLists all distinct values for a given tag key, optionally filtered by resource type.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
