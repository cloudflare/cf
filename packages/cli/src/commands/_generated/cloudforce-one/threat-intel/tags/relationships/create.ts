/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		confidence: {
			kind: "parsed",
			brief: "Confidence score 0–100.",
			optional: true,
			parse: Number,
		},
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset UUID where the relationship row will be stored (locates the Indicators DO).",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Arbitrary JSON metadata. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"target-id": {
			kind: "parsed",
			brief: "UUID of the target entity.",
			optional: true,
			parse: String,
		},
		"target-type": {
			kind: "parsed",
			brief:
				'Target type. "tag" is not allowed (tag↔tag relationships are not supported).',
			optional: true,
			choices: ["event", "indicator"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "target-type", "text"),
		},
		type: {
			kind: "parsed",
			brief: "Relationship type.",
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
	operands: [{ placeholder: "tag-uuid", brief: "Tag UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <tag-uuid>",
	describe: "Create a tag relationship",
	usage:
		"$0 cloudforce-one threat-intel tags relationships create <tag-uuid>\n\nCreates a relationship from a tag to an event or indicator (`targetType`) in the dataset given by `datasetId`. Relationships between two tags are not supported.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
