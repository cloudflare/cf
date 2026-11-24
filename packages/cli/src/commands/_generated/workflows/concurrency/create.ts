/**
 * create command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: {
			kind: "parsed",
			brief: "Maximum number of steps that may concurrently hold this key.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"Unique (per account) name of the concurrency key. Referenced by workflow steps via step config.",
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
	describe: "Create a concurrency key",
	usage:
		"$0 workflows concurrency create\n\nCreates an account-scoped concurrency key. Limits count steps still in flight from a previously deleted key of the same name.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
