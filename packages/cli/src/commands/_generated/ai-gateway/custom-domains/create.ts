/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		domain: {
			kind: "parsed",
			brief: "Custom hostname that you own, such as `ai.example.com`.",
			optional: true,
			parse: String,
		},
		"min-tls": {
			kind: "parsed",
			brief: "The minTLS field",
			optional: true,
			choices: ["1.0", "1.1", "1.2", "1.3"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "min-tls", "text"),
		},
		"zone-id": {
			kind: "parsed",
			brief: "ID of the Cloudflare zone that contains the custom hostname.",
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
	describe: "Create a custom domain for a gateway",
	usage:
		"$0 ai-gateway custom-domains create <gateway-id>\n\nProvisions a Cloudflare-for-SaaS custom hostname and returns the CNAME target to point DNS at.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
