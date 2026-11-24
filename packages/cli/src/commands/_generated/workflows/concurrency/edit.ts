/**
 * edit command
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
	operands: [
		{
			placeholder: "key-id",
			brief: "Identifier of the concurrency key.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <key-id>",
	describe: "Update a concurrency key",
	usage:
		"$0 workflows concurrency edit <key-id>\n\nUpdates the limit of a concurrency key. Applies to instances that start after the change.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
