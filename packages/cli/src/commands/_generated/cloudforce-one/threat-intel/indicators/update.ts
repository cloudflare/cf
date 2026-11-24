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
		"dataset-id": { kind: "parsed", brief: "Dataset ID.", parse: String },
		"indicator-type": {
			kind: "parsed",
			brief: "The indicatorType field",
			optional: true,
			parse: String,
		},
		"related-events": {
			kind: "parsed",
			brief:
				'The relatedEvents field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"datasetId": string, "eventId": string}].',
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief:
				"Traffic Light Protocol designation. Case-insensitive on input, stored and returned as UPPERCASE. Allowed values: clear, green, amber, amber-strict, red, purple.",
			optional: true,
			parse: String,
		},
		value: {
			kind: "parsed",
			brief: "The value field",
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
	command: "update <indicator-id>",
	describe: "Update an indicator",
	usage:
		"$0 cloudforce-one threat-intel indicators update <indicator-id>\n\nUpdates the given fields of an indicator and leaves the other fields unchanged.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
