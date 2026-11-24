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
		{ placeholder: "dataset-id", brief: "Dataset ID to delete", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <dataset-id>",
	describe: "Delete a dataset",
	usage:
		"$0 cloudforce-one threat-intel datasets delete <dataset-id>\n\nDeletes a dataset. To see deleted datasets, use `threat-intel datasets list` with `includeDeleted`.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
