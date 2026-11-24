/**
 * list command
 * @generated from apis/overlays/magic-transit.ts
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
	describe: "List BGP Filter Profiles",
	usage:
		"$0 magic-transit bgp-filter-profiles list\n\nLists all BGP filter profiles for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
