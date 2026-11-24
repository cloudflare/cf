/**
 * list command
 * @generated from apis/overlays/ips.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		networks: {
			kind: "parsed",
			brief:
				"Specified as `jdcloud` to list IPs used by JD Cloud data centers.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Cloudflare/JD Cloud IP Details",
	usage:
		"$0 ips list\n\nGet IPs used on the Cloudflare/JD Cloud network, see https://www.cloudflare.com/ips for Cloudflare IPs or https://developers.cloudflare.com/china-network/reference/infrastructure/ for JD Cloud IPs.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
