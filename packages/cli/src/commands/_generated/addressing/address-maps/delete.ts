/**
 * delete command
 * @generated from apis/overlays/addressing.ts
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
			placeholder: "address-map-id",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <address-map-id>",
	describe: "Delete Address Map",
	usage:
		"$0 addressing address-maps delete <address-map-id>\n\nDelete a particular address map owned by the account. An Address Map must be disabled before it can be deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
