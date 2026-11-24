/**
 * copy command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"keep-raw-data": {
			kind: "boolean",
			brief:
				"If true, copies raw data to the destination dataset. Default is false (raw data is stripped/not copied).",
			optional: true,
		},
		"dest-dataset-id": {
			kind: "parsed",
			brief: "The destDatasetId field",
			optional: true,
			parse: String,
		},
		"event-ids": {
			kind: "parsed",
			brief: "The eventIds field",
			variadic: true,
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
		{ placeholder: "dataset-id", brief: "Dataset UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "copy <dataset-id>",
	describe: "Copy events to another dataset",
	usage:
		"$0 cloudforce-one threat-intel events copy <dataset-id>\n\nCopies events to the dataset given by `destDatasetId` and leaves the originals in place. Raw event data is copied only when `keepRawData` is true.",
	...parameters,
	loader: () => import("./copy.handler.js"),
});

export default command;
