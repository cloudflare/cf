/**
 * update command
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
		secret: {
			kind: "parsed",
			brief:
				"Provider API key to store in the Secrets Store configured on the gateway.",
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
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <id>",
	describe: "Rotate a provider key",
	usage:
		"$0 ai-gateway gateways providers update <id>\n\nReplaces the stored API key of a provider key configuration. Only the key can change.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
