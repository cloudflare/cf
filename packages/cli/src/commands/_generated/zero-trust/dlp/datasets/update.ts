/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"case-sensitive": {
			kind: "boolean",
			brief:
				"Determines if the words should be matched in a case-sensitive manner.\n\nOnly required for custom word lists.",
			optional: true,
		},
		description: {
			kind: "parsed",
			brief: "The description of the dataset.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the dataset, must be unique.",
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
			brief: "Dataset description.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "dataset-id", brief: "Dataset ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <dataset-id>",
	describe: "Update details about a dataset",
	usage:
		"$0 zero-trust dlp datasets update <dataset-id>\n\nUpdates the configuration of an existing DLP dataset, such as its name, description, or detection settings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
