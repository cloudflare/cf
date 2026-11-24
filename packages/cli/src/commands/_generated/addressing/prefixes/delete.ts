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
			placeholder: "prefix-id",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <prefix-id>",
	describe: "Delete Prefix",
	usage:
		"$0 addressing prefixes delete <prefix-id>\n\nDelete an unapproved prefix owned by the account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
