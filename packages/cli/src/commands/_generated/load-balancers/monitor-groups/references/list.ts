/**
 * list command
 * @generated from apis/overlays/load-balancers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"monitor-group-id": {
			kind: "parsed",
			brief: "Monitor group ID",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Monitor Group References",
	usage:
		"$0 load-balancers monitor-groups references list\n\nGet the list of resources that reference the provided monitor group.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
