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
		to: {
			kind: "parsed",
			brief:
				"End of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		from: {
			kind: "parsed",
			brief:
				"Start of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			parse: Number,
		},
		"sort-by": {
			kind: "enum",
			brief: "Dimension to sort results by.",
			values: [
				"colo",
				"device_id",
				"mode",
				"platform",
				"status",
				"timestamp",
				"version",
			],
			optional: true,
		},
		colo: {
			kind: "parsed",
			brief: "Cloudflare colo airport code.",
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief: "Device-specific ID, given as UUID.",
			optional: true,
			parse: String,
		},
		"device-mode": {
			kind: "parsed",
			brief: "The mode under which the WARP client is run.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "Network status.",
			optional: true,
			parse: String,
		},
		platform: {
			kind: "parsed",
			brief: "Operating system.",
			optional: true,
			parse: String,
		},
		"warp-version": {
			kind: "parsed",
			brief: "WARP client version.",
			optional: true,
			parse: String,
		},
		source: {
			kind: "enum",
			brief:
				"Source:\n  * `hourly` - device details aggregated hourly, up to 7 days prior\n  * `last_seen` - device details, up to 60 minutes prior. Time windows exceeding 60 minutes will be rejected from June 1st, 2026. Please use 'hourly' or 'raw' instead for longer time ranges.\n  * `raw` - device details, up to 7 days prior",
			values: ["last_seen", "hourly", "raw"],
			optional: true,
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
	describe: "List details of devices using WARP.",
	usage:
		"$0 zero-trust dex devices list\n\nList details of devices using WARP.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
