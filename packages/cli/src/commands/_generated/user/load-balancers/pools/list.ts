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
		monitor: {
			kind: "parsed",
			brief:
				"The ID of the Monitor to use for checking the health of origins within this pool.",
			optional: true,
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
	describe: "List Pools",
	usage: "$0 user load-balancers pools list\n\nList configured pools.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
