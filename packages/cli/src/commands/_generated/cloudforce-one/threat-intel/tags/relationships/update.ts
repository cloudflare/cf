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
		"tag-uuid": { kind: "parsed", brief: "Tag UUID.", parse: String },
		"dataset-id": {
			kind: "parsed",
			brief: "Dataset UUID containing the relationship.",
			parse: String,
		},
		confidence: {
			kind: "parsed",
			brief: "Updated confidence. null clears it.",
			optional: true,
			parse: Number,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Updated metadata. null clears it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Updated relationship type.",
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
		{ placeholder: "rel-uuid", brief: "Relationship UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <rel-uuid>",
	describe: "Update a tag relationship",
	usage:
		"$0 cloudforce-one threat-intel tags relationships update <rel-uuid>\n\nUpdates the given fields of a tag relationship and leaves the other fields unchanged. `datasetId` is required.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
