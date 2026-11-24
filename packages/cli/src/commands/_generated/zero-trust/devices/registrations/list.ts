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
		"user-id": {
			kind: "parsed",
			brief: "Filter by user ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"seen-after": {
			kind: "parsed",
			brief:
				"Filter by the last_seen timestamp - returns only registrations last seen after this timestamp.",
			optional: true,
			parse: String,
		},
		"seen-before": {
			kind: "parsed",
			brief:
				"Filter by the last_seen timestamp - returns only registrations last seen before this timestamp.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter by registration status. Defaults to 'active'.",
			values: ["active", "all", "revoked"],
			optional: true,
		},
		"registration-type": {
			kind: "enum",
			brief: "Filter by registration client type.",
			values: ["warp", "browser_extension"],
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "The maximum number of devices to return in a single response.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Filter by registration details.",
			optional: true,
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief: "The registration field to order results by.",
			values: ["id", "user.name", "user.email", "last_seen_at", "created_at"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token indicating the starting position when requesting the next set of records. A cursor value can be obtained from the result_info.cursor field in the response.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief: "Filter by registration ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief: "Filter by WARP device ID.",
			optional: true,
			parse: String,
		},
		"policy-id": {
			kind: "parsed",
			brief:
				"Filter by the ID of the device settings profile assigned to the registration.",
			optional: true,
			parse: String,
		},
		include: {
			kind: "parsed",
			brief:
				'Comma-separated list of additional information that should be included in the registration response. Supported values are: "policy".',
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
	describe: "List registrations",
	usage:
		"$0 zero-trust devices registrations list\n\nLists WARP registrations.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
