/**
 * test command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"gateway-id": {
			kind: "parsed",
			brief: "Unique identifier of the AI Gateway within the account.",
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
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "test <id>",
	describe: "Check stored provider credentials",
	usage:
		"$0 ai-gateway gateways providers test <id>\n\nChecks whether stored credentials can list models through the provider implementation in AI Gateway. Requires AI Gateway content update permission. Does not run inference, check credits or inference permissions, or return provider response bodies. HTTP 401 from the model-list request is classified as invalid, as is AWS Bedrock HTTP 403 with an UnrecognizedClientException error type. Other failures are inconclusive, including other HTTP 400 or 403 responses; a 403 alone does not distinguish rejected credentials from insufficient permissions. Unsupported providers or credential formats also return an inconclusive result.",
	...parameters,
	loader: () => import("./test.handler.js"),
});

export default command;
