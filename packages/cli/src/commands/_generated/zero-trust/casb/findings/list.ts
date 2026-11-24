/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cursor: {
			kind: "parsed",
			brief:
				"A cursor for pagination. Obtained from the `result_info.cursor` field of a previous response.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		ignored: {
			kind: "boolean",
			brief:
				'Filter for only the ignored findings. Set to false to only see "active" items',
			optional: true,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by an integration ID",
			optional: true,
			parse: String,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		observation: {
			kind: "enum",
			brief: "Filter by observation type of the finding",
			values: ["Activity", "Insight", "Issue"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Which field to use when ordering the findings.",
			values: [
				"finding.name",
				"instance_count",
				"integration.name",
				"latest_affliction_date",
				"severity",
			],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		product: {
			kind: "enum",
			brief: "Filter by product category of the finding",
			values: ["Cloud", "Saas"],
			optional: true,
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		severity: {
			kind: "enum",
			brief: "Filter by severity",
			values: ["Critical", "High", "Medium", "Low"],
			optional: true,
		},
		type: {
			kind: "enum",
			brief: "Filter by type of the finding",
			values: ["Content", "Posture"],
			optional: true,
		},
		vendor: {
			kind: "enum",
			brief: "Filter by vendor",
			values: [
				"ANTHROPIC",
				"AWS",
				"BITBUCKET",
				"BOX",
				"CONFLUENCE",
				"DROPBOX",
				"GITHUB",
				"GOOGLE_CLOUD_PLATFORM",
				"GOOGLE_WORKSPACE",
				"JIRA",
				"MICROSOFT",
				"MICROSOFT_INTERNAL",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
				"ZOOM",
			],
			optional: true,
		},
		"finding-type-ids": {
			kind: "parsed",
			brief: "A comma separated list of UUIDs identifying the finding type(s).",
			optional: true,
			parse: String,
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
	describe: "List posture findings",
	usage:
		"$0 zero-trust casb findings list\n\nList all security findings that have been identified as being problematic. This will return a list of findings regardless if they have been ignored or not.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
