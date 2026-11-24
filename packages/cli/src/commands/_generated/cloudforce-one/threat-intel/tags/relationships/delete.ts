/**
 * delete command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tag-uuid": { kind: "parsed", brief: "Tag UUID.", parse: String },
		"dataset-id": {
			kind: "parsed",
			brief: "Dataset UUID containing the relationship.",
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
	},
	operands: [
		{ placeholder: "rel-uuid", brief: "Relationship UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <rel-uuid>",
	describe: "Delete a tag relationship",
	usage:
		"$0 cloudforce-one threat-intel tags relationships delete <rel-uuid>\n\nDeletes a tag relationship by its UUID. `datasetId` is required. Returns `deleted: false` if the relationship doesn't exist.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
