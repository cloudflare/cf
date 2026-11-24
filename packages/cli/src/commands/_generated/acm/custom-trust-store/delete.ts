/**
 * delete command
 * @generated from apis/overlays/acm.ts
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
			placeholder: "custom-origin-trust-store-id",
			brief: "Certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <custom-origin-trust-store-id>",
	describe: "Delete Custom Origin Trust Store",
	usage:
		"$0 acm custom-trust-store delete <custom-origin-trust-store-id>\n\nRemoves a root CA certificate from the custom origin trust store. Origins using certificates signed by this CA will no longer be trusted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
