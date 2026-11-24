/**
 * list command
 * @generated from apis/overlays/vectorize.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"index-name": { kind: "parsed", brief: "Index name", parse: String },
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
	describe: "List Metadata Indexes",
	usage:
		"$0 vectorize metadata-indexes list\n\nList Metadata Indexes for the specified Vectorize Index.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
