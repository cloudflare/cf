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
		"address-map-id": {
			kind: "parsed",
			brief: "Identifier of an Address Map.",
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
			placeholder: "member-account-id",
			brief: "Identifier of a Cloudflare account.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <member-account-id>",
	describe: "Remove an account membership from an Address Map",
	usage:
		"$0 addressing address-maps accounts delete <member-account-id>\n\nRemove an account as a member of a particular address map.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
