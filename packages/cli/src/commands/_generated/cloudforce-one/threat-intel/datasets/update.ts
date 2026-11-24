/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"is-public": {
			kind: "boolean",
			brief:
				"If true, then anyone can search the dataset. If false, then its limited to the account.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Used to describe the dataset within the account context.",
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
	operands: [
		{ placeholder: "dataset-id", brief: "Dataset ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <dataset-id>",
	describe: "Update a dataset",
	usage:
		"$0 cloudforce-one threat-intel datasets update <dataset-id>\n\nUpdates a dataset's `name` and `isPublic` setting. Both fields are required.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
