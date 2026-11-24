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
	operands: [{ placeholder: "cookie-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <cookie-id>",
	describe: "Get a detected cookie",
	usage:
		"$0 client-side-security cookies get <cookie-id>\n\nReturns a cookie detected on the zone by cookie ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
