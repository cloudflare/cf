/**
 * delete command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"custom-hostname-id": {
			kind: "parsed",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
		"certificate-pack-id": {
			kind: "parsed",
			brief: "Custom hostname identifier tag.",
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
			placeholder: "certificate-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <certificate-id>",
	describe: "Delete Single Certificate And Key For Custom Hostname",
	usage:
		"$0 custom-hostnames certificate-pack certificates delete <certificate-id>\n\nDelete a single custom certificate from a certificate pack that contains two bundled certificates. Deletion is subject to the following constraints. You cannot delete a certificate if it is the only remaining certificate in the pack. At least one certificate must remain in the pack.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
