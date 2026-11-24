/**
 * list command
 * @generated from apis/overlays/durable-objects.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: { kind: "parsed", brief: "ID of the namespace.", parse: String },
		limit: {
			kind: "parsed",
			brief:
				"The number of objects to return. The cursor attribute may be used to iterate over the next batch of objects if there are more than the limit.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token indicating the position from which to continue when requesting the next set of records. A valid value for the cursor can be obtained from the cursors object in the result_info structure.",
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
	command: "list",
	describe: "List Objects in a Durable Object namespace",
	usage:
		"$0 durable-objects namespaces objects list\n\nReturns the Durable Objects in a given Durable Object namespace.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
