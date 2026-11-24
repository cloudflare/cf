/**
 * delete command
 * @generated from apis/overlays/email-routing.ts
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
			placeholder: "destination-address-identifier",
			brief: "Destination address identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <destination-address-identifier>",
	describe: "Delete destination address",
	usage:
		"$0 email-routing addresses delete <destination-address-identifier>\n\nDeletes a specific destination address.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
