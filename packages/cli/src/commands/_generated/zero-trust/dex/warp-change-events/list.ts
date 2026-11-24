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
		from: {
			kind: "parsed",
			brief: "Start time for the query in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		type: {
			kind: "enum",
			brief: "Filter events by type 'config' or 'toggle'.",
			values: ["config", "toggle"],
			optional: true,
		},
		toggle: {
			kind: "enum",
			brief:
				"Filter events by type toggle value. Applicable to type='toggle' events only.",
			values: ["on", "off"],
			optional: true,
		},
		"config-name": {
			kind: "parsed",
			brief:
				"Filter events by WARP configuration name changed from or to. Applicable to type='config' events only.",
			optional: true,
			parse: String,
		},
		"account-name": {
			kind: "parsed",
			brief: "Filter events by account name.",
			optional: true,
			parse: String,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort response by event timestamp.",
			values: ["ASC", "DESC"],
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
	describe: "List WARP change events.",
	usage:
		"$0 zero-trust dex warp-change-events list\n\nList WARP configuration and enablement toggle change events by device.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
