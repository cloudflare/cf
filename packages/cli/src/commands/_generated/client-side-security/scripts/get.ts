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
	operands: [{ placeholder: "script-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <script-id>",
	describe: "Get a detected script",
	usage:
		"$0 client-side-security scripts get <script-id>\n\nReturns a script detected on the zone by script ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
