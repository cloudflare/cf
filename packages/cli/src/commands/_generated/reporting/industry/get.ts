/**
 * get command
 * @generated from apis/overlays/reporting.ts
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
	describe: "Get an account industry",
	usage:
		"$0 reporting industry get\n\nGets the industry classification for an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
