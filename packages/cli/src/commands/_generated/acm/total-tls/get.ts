/**
 * get command
 * @generated from apis/overlays/acm.ts
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
	describe: "Total TLS Settings Details",
	usage: "$0 acm total-tls get\n\nGet Total TLS Settings for a Zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
