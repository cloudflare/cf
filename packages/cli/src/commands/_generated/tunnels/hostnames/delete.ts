/**
 * delete command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			parse: String,
		},
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
			placeholder: "hostname-id",
			brief: "UUID of the tunnel hostname.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <hostname-id>",
	describe: "Delete a tunnel hostname",
	usage:
		"$0 tunnels hostnames delete <hostname-id>\n\nDeletes a hostname assigned to a tunnel.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
