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
				'SCIM filter expression (RFC 7644 Section 3.4.2.2). Only `displayName eq "value"` is supported.',
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
	describe: "List SCIM Groups",
	usage:
		"$0 scim groups list\n\nLists SCIM Group resources for the account. Returns both system groups (backed by Cloudflare permission groups, prefixed `cloudflare-v1-`) and custom user groups. Supports filtering by `displayName` using SCIM filter syntax.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
