/**
 * get command
 * @generated from apis/overlays/client-side-security.ts
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
		{ placeholder: "connection-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <connection-id>",
	describe: "Get a detected connection",
	usage:
		"$0 client-side-security connections get <connection-id>\n\nReturns a webpage connection detected on the zone by connection ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
