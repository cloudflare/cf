/**
 * update command
 * @generated from apis/overlays/logs.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"deletion-protection": {
			kind: "boolean",
			brief: "Set to `false` to allow deletion of this dataset.",
			optional: true,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether to enable or disable log ingest for this dataset.",
			optional: true,
		},
		fields: {
			kind: "parsed",
			brief:
				'Controls which fields the API ingests after the update. Defaults\nto all available fields when absent. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"enabled": boolean, "name": string}].',
			optional: true,
			parse: String,
		},
		filter: {
			kind: "parsed",
			brief:
				'Optional Logpush filter predicate to restrict which events are\ningested. If omitted, the existing filter is left unchanged. Set\nto an empty string (`""`) to clear the filter. Otherwise,\nreplaces the dataset\'s filter entirely.\nSee [Logpush filters](https://developers.cloudflare.com/logs/reference/filters/)\nfor syntax and examples.\n',
			optional: true,
			parse: String,
		},
		"filter-attack-traffic": {
			kind: "boolean",
			brief:
				"Whether to filter attack traffic from the Logpush job. If omitted,\nthe existing setting is left unchanged. Supported datasets are\n`http_requests`, `firewall_events`, and `network_analytics_logs`.\n",
			optional: true,
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
		{
			placeholder: "dataset-id",
			brief: "Log Explorer dataset ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <dataset-id>",
	describe: "Update an account or zone dataset",
	usage:
		"$0 logs datasets update <dataset-id>\n\nUpdates the enabled state and/or field configuration of an account or zone dataset.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
