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
				"Opaque token indicating the starting position when requesting the next set of records. A cursor value can be obtained from the result_info.cursor field in the response.",
			optional: true,
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief: "The device field to order results by.",
			values: [
				"name",
				"id",
				"client_version",
				"last_seen_user.email",
				"last_seen_at",
				"active_registrations",
				"created_at",
			],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		"last-seen-user-email": {
			kind: "parsed",
			brief: "Filter by the last seen user's email.",
			optional: true,
			parse: String,
		},
		"seen-after": {
			kind: "parsed",
			brief:
				"Filter by the last_seen timestamp - returns only devices last seen after this timestamp.",
			optional: true,
			parse: String,
		},
		"seen-before": {
			kind: "parsed",
			brief:
				"Filter by the last_seen timestamp - returns only devices last seen before this timestamp.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "The maximum number of devices to return in a single response.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search by device details.",
			optional: true,
			parse: String,
		},
		"active-registrations": {
			kind: "enum",
			brief:
				'Include or exclude devices with active registrations. The default is "only" - return only devices with active registrations.',
			values: ["include", "only", "exclude"],
			optional: true,
		},
		"has-registration-type": {
			kind: "enum",
			brief:
				"Filter by the type of active registration associated with the device.",
			values: ["warp", "browser_extension"],
			optional: true,
		},
		id: {
			kind: "parsed",
			brief: "Filter by a one or more device IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		tag: {
			kind: "parsed",
			brief:
				"Filter by one or more device tags in key:value format. Devices must match all provided tags.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"last-seen-registration-policy-id": {
			kind: "parsed",
			brief:
				"Filter by the ID of the device settings profile assigned to the device registration.",
			optional: true,
			parse: String,
		},
		include: {
			kind: "parsed",
			brief:
				'Comma-separated list of additional information that should be included in the device response. Supported values are: "last_seen_registration.policy".',
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
	describe: "List devices",
	usage: "$0 zero-trust devices list\n\nLists WARP devices.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
