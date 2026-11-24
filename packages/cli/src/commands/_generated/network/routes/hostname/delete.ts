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
		{
			placeholder: "hostname-route-id",
			brief: "The hostname route ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <hostname-route-id>",
	describe: "Delete hostname route",
	usage:
		"$0 network routes hostname delete <hostname-route-id>\n\nDelete a hostname route.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
