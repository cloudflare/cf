/**
 * delete command
 * @generated from apis/overlays/custom-nameservers.ts
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
			placeholder: "custom-ns-id",
			brief: "The FQDN of the name server.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <custom-ns-id>",
	describe: "Delete Account Custom Nameserver",
	usage:
		"$0 custom-nameservers delete <custom-ns-id>\n\nRemoves a custom nameserver from the account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
