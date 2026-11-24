/**
 * get command
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
	command: "get <nameserver-set-id>",
	describe: "Get Custom Nameserver Set",
	usage:
		"$0 dns settings account nameserver-sets get <nameserver-set-id>\n\nGets a Custom Nameserver Set owned by an account. For details, refer to [Nameserver sets](https://developers.cloudflare.com/dns/nameservers/custom-nameservers/nameserver-sets/).",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
