/**
 * delete command
 * @generated from apis/overlays/dns-firewall.ts
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
		{ placeholder: "dns-firewall-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <dns-firewall-id>",
	describe: "Delete DNS Firewall Cluster",
	usage:
		"$0 dns-firewall delete <dns-firewall-id>\n\nDelete a DNS Firewall cluster",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
