/**
 * delete command
 * @generated from apis/overlays/network.ts
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
		{ placeholder: "route-id", brief: "UUID of the route.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <route-id>",
	describe: "Delete a tunnel route",
	usage:
		"$0 network routes cidr delete <route-id>\n\nDeletes a private network route from an account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
