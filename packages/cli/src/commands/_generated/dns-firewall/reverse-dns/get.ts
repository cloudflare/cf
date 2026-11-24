/**
 * get command
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
	},
	operands: [
		{ placeholder: "dns-firewall-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <dns-firewall-id>",
	describe: "Show DNS Firewall Cluster Reverse DNS",
	usage:
		"$0 dns-firewall reverse-dns get <dns-firewall-id>\n\nShow reverse DNS configuration (PTR records) for a DNS Firewall cluster",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
