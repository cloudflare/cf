/**
 * get command
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
	command: "get",
	describe: "Get Zone Hold",
	usage:
		"$0 zones holds get\n\nRetrieve whether the zone is subject to a zone hold, and metadata about the hold.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
