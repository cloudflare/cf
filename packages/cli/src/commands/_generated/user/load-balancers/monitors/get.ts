/**
 * get command
 * @generated from apis/overlays/user.ts
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
	operands: [{ placeholder: "monitor-id", brief: "Monitor ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <monitor-id>",
	describe: "Monitor Details",
	usage:
		"$0 user load-balancers monitors get <monitor-id>\n\nFetch a single configured monitor for a user.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
