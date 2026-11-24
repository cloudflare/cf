/**
 * delete command
 * @generated from apis/overlays/custom-csrs.ts
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
			placeholder: "custom-csr-id",
			brief: "Custom CSR identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <custom-csr-id>",
	describe: "Delete Custom CSR",
	usage:
		"$0 custom-csrs delete <custom-csr-id>\n\nDelete a custom Certificate Signing Request (CSR) and its associated private key.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
