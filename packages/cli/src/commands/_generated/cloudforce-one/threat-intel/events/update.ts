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
		attacker: {
			kind: "parsed",
			brief: "The attacker field",
			optional: true,
			parse: String,
		},
		"attacker-country": {
			kind: "parsed",
			brief: "The attackerCountry field",
			optional: true,
			parse: String,
		},
		category: {
			kind: "parsed",
			brief: "The category field",
			optional: true,
			parse: String,
		},
		"created-at": {
			kind: "parsed",
			brief: "The createdAt field",
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "Dataset ID containing the event to update.",
			optional: true,
			parse: String,
		},
		date: {
			kind: "parsed",
			brief: "The date field",
			optional: true,
			parse: String,
		},
		event: {
			kind: "parsed",
			brief: "The event field",
			optional: true,
			parse: String,
		},
		indicator: {
			kind: "parsed",
			brief: "The indicator field",
			optional: true,
			parse: String,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "The indicatorType field",
			optional: true,
			parse: String,
		},
		insight: {
			kind: "parsed",
			brief: "The insight field",
			optional: true,
			parse: String,
		},
		"raw-data": {
			kind: "parsed",
			brief:
				'The raw.data field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"raw-source": {
			kind: "parsed",
			brief: "The raw.source field",
			optional: true,
			parse: String,
		},
		"raw-tlp": {
			kind: "parsed",
			brief: "The raw.tlp field",
			optional: true,
			parse: String,
		},
		"target-country": {
			kind: "parsed",
			brief: "The targetCountry field",
			optional: true,
			parse: String,
		},
		"target-industry": {
			kind: "parsed",
			brief: "The targetIndustry field",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
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
	operands: [{ placeholder: "event-id", brief: "Event UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <event-id>",
	describe: "Update an event",
	usage:
		"$0 cloudforce-one threat-intel events update <event-id>\n\nUpdates the given fields of an event and leaves the other fields unchanged. `datasetId` is required.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
