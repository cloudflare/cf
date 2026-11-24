/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		alias: {
			kind: "parsed",
			brief: "The alias field",
			optional: true,
			parse: String,
		},
		"default-config": {
			kind: "boolean",
			brief: "The default_config field",
			optional: true,
		},
		"provider-slug": {
			kind: "parsed",
			brief: "The provider_slug field",
			optional: true,
			parse: String,
		},
		"rate-limit": {
			kind: "parsed",
			brief: "The rate_limit field",
			optional: true,
			parse: Number,
		},
		"rate-limit-period": {
			kind: "parsed",
			brief: "The rate_limit_period field",
			default: "60",
			parse: Number,
		},
		secret: {
			kind: "parsed",
			brief:
				"Provider API key to store in the Secrets Store configured on the gateway.",
			optional: true,
			parse: String,
		},
		"secret-id": {
			kind: "parsed",
			brief: "The secret_id field",
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
	operands: [
		{
			placeholder: "gateway-id",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <gateway-id>",
	describe: "Store a provider key",
	usage:
		"$0 ai-gateway gateways providers create <gateway-id>\n\nStores an upstream AI provider API key for an AI Gateway in the Secrets Store configured on the gateway, with an optional rate limit. Pass `secret` to store a new key, or omit it to use an existing Secrets Store secret.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
