/**
 * summary command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		service: {
			kind: "parsed",
			brief: "Service",
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
	command: "summary",
	describe: "Summarize detected issues",
	usage:
		"$0 o11y issues summary\n\nRetrieve aggregate issue counts for the account.",
	...parameters,
	loader: () => import("./summary.handler.js"),
});

export default command;
