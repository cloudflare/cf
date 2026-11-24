/**
 * create command
 * @generated from apis/overlays/logs.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		dataset: {
			kind: "parsed",
			brief: "Dataset type name to create (e.g. `http_requests`).",
			optional: true,
			parse: String,
		},
		fields: {
			kind: "parsed",
			brief:
				'Controls which fields the API ingests. Defaults to all available\nfields when absent. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"enabled": boolean, "name": string}].',
			optional: true,
			parse: String,
		},
		filter: {
			kind: "parsed",
			brief:
				"Optional Logpush filter predicate to restrict which events are ingested.\nSee [Logpush filters](https://developers.cloudflare.com/logs/reference/filters/)\nfor syntax and examples.\n",
			optional: true,
			parse: String,
		},
		"filter-attack-traffic": {
			kind: "boolean",
			brief:
				"Whether to filter attack traffic from the Logpush job. Defaults to\n`true` for supported datasets when omitted. Supported datasets are\n`http_requests`, `firewall_events`, and `network_analytics_logs`.\n",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create an account or zone dataset",
	usage:
		"$0 logs datasets create\n\nCreate a new Log Explorer dataset for the account or zone. List available account or zone datasets to see the dataset types and fields you can use. The `fields` property is optional. If not specified, all available fields will be enabled. For dataset field definitions, see: https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
