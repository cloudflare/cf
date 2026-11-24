/**
 * get-request command
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
	command: "get-request <id>",
	describe: "Get Gateway Log Request",
	usage:
		"$0 ai-gateway logs get-request <id>\n\nRetrieves the original request payload for an AI Gateway log entry.",
	...parameters,
	loader: () => import("./get-request.handler.js"),
});

export default command;
