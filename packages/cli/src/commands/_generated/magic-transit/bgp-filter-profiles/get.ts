/**
 * get command
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
	operands: [{ placeholder: "profile-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <profile-id>",
	describe: "Get BGP Filter Profile",
	usage:
		"$0 magic-transit bgp-filter-profiles get <profile-id>\n\nGets a specific BGP filter profile for an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
