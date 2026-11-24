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
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
		confidence: {
			kind: "parsed",
			brief: "Confidence score 0–100.",
			optional: true,
			parse: Number,
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
				'Target type. "indicator" is not allowed (indicator↔indicator relationships are not supported).',
			optional: true,
			choices: ["event", "tag"],
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
	operands: [
		{ placeholder: "indicator-id", brief: "Indicator UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <indicator-id>",
	describe: "Create an indicator relationship",
	usage:
		"$0 cloudforce-one threat-intel indicators relationships create <indicator-id>\n\nCreates a relationship from an indicator to an event or tag (`targetType`). Relationships between two indicators are not supported.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
