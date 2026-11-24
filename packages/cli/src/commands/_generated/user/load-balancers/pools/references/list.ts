/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"pool-id": { kind: "parsed", brief: "Pool ID", parse: String },
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
	describe: "List Pool References",
	usage:
		"$0 user load-balancers pools references list\n\nGet the list of resources that reference the provided pool.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
