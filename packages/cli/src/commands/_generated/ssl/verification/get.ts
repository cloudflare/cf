/**
 * get command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		retry: {
			kind: "enum",
			brief: "Immediately retry SSL Verification.",
			values: ["true"],
			optional: true,
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
	command: "get",
	describe: "SSL Verification Details",
	usage: "$0 ssl verification get\n\nGet SSL Verification Info for a Zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
