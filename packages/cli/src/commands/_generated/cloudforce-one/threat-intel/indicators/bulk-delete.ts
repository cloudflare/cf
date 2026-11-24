/**
 * bulk-delete command
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
		"indicator-ids": {
			kind: "parsed",
			brief: "Indicator UUIDs to delete, 1-200 per request.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-delete",
	describe: "Delete indicators in bulk",
	usage:
		"$0 cloudforce-one threat-intel indicators bulk-delete\n\nDeletes up to 200 indicators from a dataset. Pass the indicator UUIDs in `indicatorIds`; UUIDs that are not found are returned in `missingUUIDs`.",
	...parameters,
	loader: () => import("./bulk-delete.handler.js"),
});

export default command;
