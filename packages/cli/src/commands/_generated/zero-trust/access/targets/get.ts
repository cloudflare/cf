/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
		{ placeholder: "target-id", brief: "Target identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <target-id>",
	describe: "Get target",
	usage:
		"$0 zero-trust access targets get <target-id>\n\nFetches a single infrastructure access target by its ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
