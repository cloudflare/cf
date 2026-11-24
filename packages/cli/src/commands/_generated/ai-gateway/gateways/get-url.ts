/**
 * get-url command
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
	},
	operands: [
		{ placeholder: "ai-gateway-provider", brief: "Provider", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-url <ai-gateway-provider>",
	describe: "Get Gateway URL",
	usage:
		"$0 ai-gateway gateways get-url <ai-gateway-provider>\n\nRetrieves the endpoint URL for an AI Gateway.",
	...parameters,
	loader: () => import("./get-url.handler.js"),
});

export default command;
