/**
 * delete command
 * @generated from apis/overlays/vectorize.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"property-name": {
			kind: "parsed",
			brief:
				"Specifies the metadata property for which the index must be deleted.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <index-name>",
	describe: "Delete Metadata Index",
	usage:
		"$0 vectorize metadata-indexes delete <index-name>\n\nAllow Vectorize to delete the specified metadata index.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
