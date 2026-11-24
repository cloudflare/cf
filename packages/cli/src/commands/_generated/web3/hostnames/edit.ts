/**
 * edit command
 * @generated from apis/overlays/web3.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Specify an optional description of the hostname.",
			optional: true,
			parse: String,
		},
		dnslink: {
			kind: "parsed",
			brief: "Specify the DNSLink value used if the target is ipfs.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "identifier",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <identifier>",
	describe: "Edit Web3 Hostname",
	usage:
		"$0 web3 hostnames edit <identifier>\n\nUpdates a Web3 hostname configuration.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
