/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "user-id", brief: "User ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <user-id>",
	describe: "Get risk event/score information for a specific user",
	usage:
		"$0 zero-trust risk-scoring get <user-id>\n\nRetrieves the detailed risk score breakdown for a specific user, including contributing factors.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
