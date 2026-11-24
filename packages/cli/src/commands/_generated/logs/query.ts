/**
 * query command
 * @generated from apis/overlays/logs.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Plain-text request body (without JSON quotes)",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "query",
	describe: "Run a log query",
	usage:
		"$0 logs query\n\nRun a SQL query against account or zone-level datasets. Timestamp fields are RFC3339 strings. Filter with: WHERE {timestamp_field} >= now() - INTERVAL '30' DAY WHERE {timestamp_field} >= '2026-04-01T00:00:00Z' WHERE {timestamp_field} BETWEEN '2026-04-01T00:00:00Z' AND '2026-04-30T23:59:59Z' List configured account or zone datasets to see enabled account or zone-level datasets. Zone-level datasets will not appear here. List available account or zone datasets to inspect their schemas and timestamp fields. For more information about the datasets, and the meaning of each field, check out https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./query.handler.js"),
});

export default command;
