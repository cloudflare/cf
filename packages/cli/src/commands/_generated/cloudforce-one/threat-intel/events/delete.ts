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
		"event-ids": {
			kind: "parsed",
			brief: "Array of Event IDs to delete.",
			variadic: true,
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
		{ placeholder: "dataset-id", brief: "Dataset UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <dataset-id>",
	describe: "Delete events",
	usage:
		"$0 cloudforce-one threat-intel events delete <dataset-id>\n\nDeletes one or more events from a dataset. Pass the event UUIDs in `eventIds`.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
