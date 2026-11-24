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
	describe: "DNS Firewall Cluster Details",
	usage:
		"$0 dns-firewall get <dns-firewall-id>\n\nShow a single DNS Firewall cluster for an account",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
