/**
 * get command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"prefix-id": {
			kind: "parsed",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "bgp-prefix-id",
			brief: "Identifier of BGP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <bgp-prefix-id>",
	describe: "Fetch BGP Prefix",
	usage:
		"$0 addressing prefixes bgp-prefixes get <bgp-prefix-id>\n\nRetrieve a single BGP Prefix according to its identifier",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
