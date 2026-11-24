/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"event-id": { kind: "parsed", brief: "Event UUID.", parse: String },
		direction: {
			kind: "enum",
			brief:
				"The direction to traverse the graph. Defaults to 'both' to search all.",
			values: ["ancestors", "descendants", "both"],
			optional: true,
		},
		"max-depth": {
			kind: "parsed",
			brief: "The maximum depth to traverse. Defaults to 5.",
			optional: true,
			parse: Number,
		},
		"relationship-types": {
			kind: "parsed",
			brief: "An optional array of relationship types to filter by.",
			optional: true,
			parse: String,
		},
		"indicator-type-ids": {
			kind: "parsed",
			brief:
				"An optional array of indicator type IDs to filter the results by.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "The dataset ID to search within.",
			parse: String,
		},
		"include-parent": {
			kind: "boolean",
			brief:
				"Whether to include the starting event in the results. Defaults to true.",
			optional: true,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"page-size": {
			kind: "parsed",
			brief: "PageSize",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List related events",
	usage:
		"$0 cloudforce-one threat-intel events relationships list\n\nLists events related to an event by following its relationships. `datasetId` is required. Use `direction`, `maxDepth`, and `relationshipTypes` to control which relationships are followed.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
