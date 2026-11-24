/**
 * delete command
 * @generated from apis/overlays/dns.ts
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
		{ placeholder: "dns-record-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <dns-record-id>",
	describe: "Delete DNS Record",
	usage:
		"$0 dns records delete <dns-record-id>\n\nPermanently removes a DNS record from the zone.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
