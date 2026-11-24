/**
 * list command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief: "The hostname route ID.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief:
				"If set, only list hostname routes that contain a substring of the given value, the filter is case-insensitive.",
			optional: true,
			parse: String,
		},
		"tunnel-id": {
			kind: "parsed",
			brief:
				"If set, only list hostname routes that point to a specific tunnel.",
			optional: true,
			parse: String,
		},
		comment: {
			kind: "parsed",
			brief: "If set, only list hostname routes with the given comment.",
			optional: true,
			parse: String,
		},
		"existed-at": {
			kind: "parsed",
			brief:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
			optional: true,
			parse: String,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only return deleted hostname routes. If `false`, exclude deleted hostname routes.",
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to display.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
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
	describe: "List hostname routes",
	usage:
		"$0 network routes hostname list\n\nLists and filters hostname routes in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
