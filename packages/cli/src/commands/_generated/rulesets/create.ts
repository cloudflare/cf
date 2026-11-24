/**
 * create command
 * @generated from apis/overlays/rulesets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"validate-only": {
			kind: "boolean",
			brief:
				"Validates the request without persisting changes when set to `true`. Responses that normally return 200 return `result: null`; endpoints that normally return 204 continue to return 204.",
			optional: true,
		},
		description: {
			kind: "parsed",
			brief: "An informative description of the ruleset.",
			default: "",
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The human-readable name of the ruleset.",
			optional: true,
			parse: String,
		},
		kind: {
			kind: "parsed",
			brief: "The kind of the ruleset.",
			optional: true,
			choices: ["managed", "custom", "root", "zone"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
		},
		phase: {
			kind: "parsed",
			brief: "The phase of the ruleset.",
			optional: true,
			choices: [
				"ddos_l4",
				"ddos_l7",
				"http_config_settings",
				"http_custom_errors",
				"http_log_custom_fields",
				"http_ratelimit",
				"http_request_cache_settings",
				"http_request_dynamic_redirect",
				"http_request_firewall_custom",
				"http_request_firewall_managed",
				"http_request_late_transform",
				"http_request_origin",
				"http_request_redirect",
				"http_request_sanitize",
				"http_request_sbfm",
				"http_request_transform",
				"http_response_cache_settings",
				"http_response_compression",
				"http_response_firewall_custom",
				"http_response_firewall_managed",
				"http_response_headers_transform",
				"magic_transit",
				"magic_transit_ids_managed",
				"magic_transit_managed",
				"magic_transit_ratelimit",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "phase", "text"),
		},
		rules: {
			kind: "parsed",
			brief:
				'The list of rules in the ruleset. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"action"?: string, "action_parameters"?: {...}, "description"?: string, "enabled"?: boolean, "exposed_credential_check"?: {...}, ...more} & {"action"?: "block", "action_parameters"?: {...}, "description"?: string}) | ...more)]. ? marks optional keys.',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create an account or zone ruleset",
	usage:
		"$0 rulesets create\n\nCreates a ruleset.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
