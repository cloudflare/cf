/**
 * create command
 * @generated from apis/overlays/logpush.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		code: {
			kind: "parsed",
			brief:
				"The SQL transformer query. Maximum 32 KB. The query must contain a FROM clause referencing a valid logpush dataset.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional customer-provided description.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Customer-provided name for identification.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create transformer",
	usage:
		"$0 logpush transformers create\n\nCreates a new custom log transformer for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
