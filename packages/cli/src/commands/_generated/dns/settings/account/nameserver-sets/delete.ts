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
		{
			placeholder: "nameserver-set-id",
			brief: "Identifier for a nameserver set.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <nameserver-set-id>",
	describe: "Delete Custom Nameserver Set",
	usage:
		"$0 dns settings account nameserver-sets delete <nameserver-set-id>\n\nDeletes an unassigned Custom Nameserver Set. For details, refer to [Nameserver sets](https://developers.cloudflare.com/dns/nameservers/custom-nameservers/nameserver-sets/).",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
