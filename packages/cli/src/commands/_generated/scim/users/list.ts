/**
 * list command
 * @generated from apis/overlays/scim.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"start-index": {
			kind: "parsed",
			brief:
				"The 1-based index of the first result in the current set of list results. Values less than 1 are treated as 1.",
			optional: true,
			parse: Number,
		},
		count: {
			kind: "parsed",
			brief: "Specifies the desired maximum number of query results per page.",
			optional: true,
			parse: Number,
		},
		filter: {
			kind: "parsed",
			brief:
				'SCIM filter expression (RFC 7644 Section 3.4.2.2). Only `userName eq "value"` is supported.',
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
	describe: "List SCIM Users",
	usage:
		'$0 scim users list\n\nLists account members as SCIM User resources. Supports optional filtering by `userName` (email) using the SCIM filter syntax (e.g. `userName eq "user@example.com"`). Pagination is controlled via `startIndex` and `count` query parameters per RFC 7644 Section 3.4.2.4.',
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
