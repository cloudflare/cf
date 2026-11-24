/**
 * get command
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
	command: "get <custom-csr-id>",
	describe: "Custom CSR Details",
	usage:
		"$0 custom-csrs get <custom-csr-id>\n\nRetrieve details for a specific custom Certificate Signing Request (CSR).\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
