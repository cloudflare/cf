/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"auto-create-type": {
			kind: "boolean",
			brief:
				"If true, automatically create the indicator type if it doesn't exist. If false (default), reject an indicator type the dataset has not registered, unless the type is pre-approved (the same list event create accepts, such as BITCOIN or ERC-20), in which case it is registered on first use. Direct create applies this check to analytics datasets too. Bulk create skips it for analytics datasets.",
			optional: true,
		},
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
		{ placeholder: "dataset-id", brief: "Dataset UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <dataset-id>",
	describe: "Create an indicator",
	usage:
		"$0 cloudforce-one threat-intel indicators create <dataset-id>\n\nCreates an indicator in a dataset. Set `autoCreateType` to create the indicator type if it doesn't exist.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
