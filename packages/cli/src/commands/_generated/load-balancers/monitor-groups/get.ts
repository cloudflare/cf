/**
 * get command
 * @generated from apis/overlays/load-balancers.ts
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
	operands: [
		{
			placeholder: "monitor-group-id",
			brief: "Monitor group ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <monitor-group-id>",
	describe: "Monitor Group Details",
	usage:
		"$0 load-balancers monitor-groups get <monitor-group-id>\n\nFetch a single configured monitor group.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
