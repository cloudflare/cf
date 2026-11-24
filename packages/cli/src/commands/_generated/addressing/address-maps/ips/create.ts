/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"address-map-id": {
			kind: "parsed",
			brief: "Identifier of an Address Map.",
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
			placeholder: "ip-address",
			brief: "An IPv4 or IPv6 address.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <ip-address>",
	describe: "Add an IP to an Address Map",
	usage:
		"$0 addressing address-maps ips create <ip-address>\n\nAdd an IP from a prefix owned by the account to a particular address map.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
