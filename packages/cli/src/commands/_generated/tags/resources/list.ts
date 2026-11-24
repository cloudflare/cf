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
		"include-navigation": {
			kind: "boolean",
			brief:
				"Resolve current namespace Worker navigation by immutable child tag. Optional read-only navigation is omitted for deleted or unresolved children. Lookups are limited to this page, at most five concurrently, with a shared two-second budget. Tag identity, ETag, filters and pagination are unchanged; name filtering still uses the stored resource name. Defaults to false.",
			optional: true,
		},
		type: {
			kind: "parsed",
			brief:
				"Filter by resource type. Can be repeated to filter by multiple types (OR logic). Example: ?type=zone&type=worker",
			variadic: true,
			optional: true,
			choices: [
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
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		name: {
			kind: "parsed",
			brief:
				"Filter by resource name. Performs a case-insensitive substring match. Example: ?name=my-zone",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief:
				"Filter by resource ID. Can be repeated up to 50 times to filter by multiple IDs. Example: ?id=abc&id=def",
			variadic: true,
			optional: true,
			parse: String,
		},
		"case-insensitive": {
			kind: "boolean",
			brief:
				"Match `tag` keys and values case-insensitively. Stored casing is unchanged. Example: ?tag=environment=production&case_insensitive=true",
			optional: true,
		},
		tag: {
			kind: "parsed",
			brief:
				"Filter resources by tag criteria. This parameter can be repeated multiple times, with AND logic between parameters.\n\nSupported syntax:\n- **Key-only**: `tag=<key>` - Resource must have the tag key (e.g., `tag=production`)\n- **Key-value**: `tag=<key>=<value>` - Resource must have the tag with specific value (e.g., `tag=env=prod`)\n- **Multiple values (OR)**: `tag=<key>=<v1>,<v2>` - Resource must have tag with any of the values (e.g., `tag=env=prod,staging`)\n- **Negate key-only**: `tag=!<key>` - Resource must not have the tag key (e.g., `tag=!archived`)\n- **Negate key-value**: `tag=<key>!=<value>` - Resource must not have the tag with specific value (e.g., `tag=region!=us-west-1`)\n\nMultiple tag parameters are combined with AND logic.",
			variadic: true,
			optional: true,
			parse: String,
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
	describe: "List tagged resources",
	usage: "$0 tags resources list\n\nLists all tagged resources for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
