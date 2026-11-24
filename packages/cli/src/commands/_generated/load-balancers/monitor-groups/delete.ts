/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <monitor-group-id>",
	describe: "Delete Monitor Group",
	usage:
		"$0 load-balancers monitor-groups delete <monitor-group-id>\n\nDelete a configured monitor group.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
