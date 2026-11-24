/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "certificate-id",
			brief: "Identify the certificate with a UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <certificate-id>",
	describe: "Delete Zero Trust certificate",
	usage:
		"$0 zero-trust gateway certificates delete <certificate-id>\n\nDelete a gateway-managed Zero Trust certificate. You must deactivate the certificate from the edge (inactive) before deleting it.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
