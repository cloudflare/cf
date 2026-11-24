/**
 * get command
 * @generated from apis/overlays/botnet-feed.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get list of ASNs",
	usage:
		"$0 botnet-feed configs asn get\n\nGets a list of all ASNs registered for a user for the DDoS Botnet Feed API.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
