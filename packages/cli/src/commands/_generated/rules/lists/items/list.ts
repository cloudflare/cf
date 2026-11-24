/**
 * list command
 * @generated from apis/overlays/rules.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"list-id": {
			kind: "parsed",
			brief: "The unique ID of the list.",
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"The pagination cursor. An opaque string token that indicates where to continue when requesting the next/previous set of records. The response provides cursor values under `result_info.cursors`. You should make no assumptions about a cursor's content or length.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Amount of results to include in each paginated response. A non-negative 32 bit integer.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief:
				"A search query to filter returned items. Its meaning depends on the list type: IP addresses must start with the provided string, hostnames and bulk redirects must contain the string, and ASNs must match the string exactly.",
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
	describe: "Get list items",
	usage: "$0 rules lists items list\n\nFetches all the items in the list.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
