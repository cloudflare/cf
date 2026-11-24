/**
 * get command
 * @generated from apis/overlays/network.ts
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
			placeholder: "address-family",
			brief: "IP address family, either \`v4\` (IPv4) or \`v6\` (IPv6)",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <address-family>",
	describe: "Get Cloudflare Source Subnet",
	usage:
		"$0 network subnets cloudflare-source get <address-family>\n\nReturns the account's default Cloudflare Source subnet for the given address family.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
