/**
 * bulk-update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset ID containing the events to update. Required to prevent cross-account modifications.",
			optional: true,
			parse: String,
		},
		"event-ids": {
			kind: "parsed",
			brief: "List of event UUIDs to update (1-100)",
			variadic: true,
			optional: true,
			parse: String,
		},
		"updates-attacker": {
			kind: "parsed",
			brief: "The updates.attacker field",
			optional: true,
			parse: String,
		},
		"updates-attacker-country": {
			kind: "parsed",
			brief: "The updates.attackerCountry field",
			optional: true,
			parse: String,
		},
		"updates-category": {
			kind: "parsed",
			brief: "The updates.category field",
			optional: true,
			parse: String,
		},
		"updates-created-at": {
			kind: "parsed",
			brief: "The updates.createdAt field",
			optional: true,
			parse: String,
		},
		"updates-event": {
			kind: "parsed",
			brief: "The updates.event field",
			optional: true,
			parse: String,
		},
		"updates-indicator": {
			kind: "parsed",
			brief: "The updates.indicator field",
			optional: true,
			parse: String,
		},
		"updates-indicator-type": {
			kind: "parsed",
			brief: "The updates.indicatorType field",
			optional: true,
			parse: String,
		},
		"updates-insight": {
			kind: "parsed",
			brief: "The updates.insight field",
			optional: true,
			parse: String,
		},
		"updates-raw-data": {
			kind: "parsed",
			brief:
				'The updates.raw.data field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"updates-raw-source": {
			kind: "parsed",
			brief: "The updates.raw.source field",
			optional: true,
			parse: String,
		},
		"updates-raw-tlp": {
			kind: "parsed",
			brief: "The updates.raw.tlp field",
			optional: true,
			parse: String,
		},
		"updates-target-country": {
			kind: "parsed",
			brief: "The updates.targetCountry field",
			optional: true,
			parse: String,
		},
		"updates-target-industry": {
			kind: "parsed",
			brief: "The updates.targetIndustry field",
			optional: true,
			parse: String,
		},
		"updates-tlp": {
			kind: "parsed",
			brief: "The updates.tlp field",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-update",
	describe: "Update events in bulk",
	usage:
		"$0 cloudforce-one threat-intel events bulk-update\n\nApplies the same field values to up to 100 events in one dataset. The `date` field can't be changed in bulk.",
	...parameters,
	loader: () => import("./bulk-update.handler.js"),
});

export default command;
