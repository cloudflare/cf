/**
 * create command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Optional description for the namespace. Max 256 characters.",
			optional: true,
			parse: String,
		},
		"public-endpoint-params-authorized-hosts": {
			kind: "parsed",
			brief: "The public_endpoint_params.authorized_hosts field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-chat-completions-endpoint-disabled": {
			kind: "boolean",
			brief: "Disable chat completions endpoint for this public endpoint.",
			optional: true,
		},
		"public-endpoint-params-custom-domains": {
			kind: "parsed",
			brief:
				"Custom domain hostnames that alias this public endpoint. GET and create responses return the current set; on update (PUT) this field is only echoed back when supplied in the request body, otherwise it is null (omit it to leave domains unchanged).",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-default-domain-enabled": {
			kind: "boolean",
			brief:
				"When false, the instance is reachable only via a registered custom domain and the default <public_endpoint_id>.search.ai.cloudflare.com host returns 404. Requires at least one custom domain. Defaults to true. public_endpoint_params is replaced wholesale on update, so resend default_domain_enabled on every update to keep the default host off — omitting it resets to true.",
			optional: true,
		},
		"public-endpoint-params-enabled": {
			kind: "boolean",
			brief: "The public_endpoint_params.enabled field",
			optional: true,
		},
		"public-endpoint-params-instances-allowed": {
			kind: "parsed",
			brief:
				"Instance IDs exposed through the namespace public endpoint. Empty means nothing is searchable. Every ID must reference an existing instance in this namespace, and the list must stay within the account's multi-instance search limit.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-mcp-description": {
			kind: "parsed",
			brief: "The public_endpoint_params.mcp.description field",
			optional: true,
			parse: String,
		},
		"public-endpoint-params-mcp-disabled": {
			kind: "boolean",
			brief: "Disable MCP endpoint for this public endpoint.",
			optional: true,
		},
		"public-endpoint-params-rate-limit-period-ms": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.period_ms field",
			optional: true,
			parse: Number,
		},
		"public-endpoint-params-rate-limit-requests": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.requests field",
			optional: true,
			parse: Number,
		},
		"public-endpoint-params-rate-limit-technique": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.technique field",
			optional: true,
			choices: ["fixed", "sliding"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"public-endpoint-params-rate-limit-technique",
					"text"
				),
		},
		"public-endpoint-params-search-endpoint-disabled": {
			kind: "boolean",
			brief: "Disable search endpoint for this public endpoint.",
			optional: true,
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
	operands: [
		{
			placeholder: "namespace",
			brief: "Name for the new namespace.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <namespace>",
	describe: "Create a namespace",
	usage:
		"$0 ai-search namespace create <namespace>\n\nCreate a namespace for organizing AI Search instances.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
