/**
 * list command
 * @generated from apis/overlays/zones.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Available Rate Plans",
	usage:
		"$0 zones rate-plans list\n\nLists all rate plans the zone can subscribe to.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
