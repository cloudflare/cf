/**
 * delete command
 * @generated from apis/overlays/ssl.ts
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
			placeholder: "keyless-certificate-id",
			brief: "Keyless certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <keyless-certificate-id>",
	describe: "Delete Keyless SSL Configuration",
	usage:
		"$0 ssl keyless-certificates delete <keyless-certificate-id>\n\nRemoves a Keyless SSL configuration. SSL connections will no longer use the keyless server for cryptographic operations.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
