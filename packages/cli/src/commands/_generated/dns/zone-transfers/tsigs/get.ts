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
	operands: [{ placeholder: "tsig-id", brief: "Tsig ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <tsig-id>",
	describe: "TSIG Details",
	usage: "$0 dns zone-transfers tsigs get <tsig-id>\n\nGet TSIG.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
