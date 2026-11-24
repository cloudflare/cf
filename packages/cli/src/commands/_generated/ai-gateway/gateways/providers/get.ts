/**
 * get command
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
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <id>",
	describe: "Get a provider key",
	usage:
		"$0 ai-gateway gateways providers get <id>\n\nRetrieves a provider key configuration for an AI Gateway. The response shows a masked preview of the key, never the key itself.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
