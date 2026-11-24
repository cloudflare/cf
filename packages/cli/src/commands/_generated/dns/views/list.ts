/**
 * list command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Exact value of the DNS view name. This is a convenience alias for `name.exact`.",
			optional: true,
			parse: String,
		},
		"name-exact": {
			kind: "parsed",
			brief: "Exact value of the DNS view name.",
			optional: true,
			parse: String,
		},
		"name-contains": {
			kind: "parsed",
			brief: "Substring of the DNS view name.",
			optional: true,
			parse: String,
		},
		"name-startswith": {
			kind: "parsed",
			brief: "Prefix of the DNS view name.",
			optional: true,
			parse: String,
		},
		"name-endswith": {
			kind: "parsed",
			brief: "Suffix of the DNS view name.",
			optional: true,
			parse: String,
		},
		"zone-id": {
			kind: "parsed",
			brief: "A zone ID that exists in the zones list for the view.",
			optional: true,
			parse: String,
		},
		"zone-name": {
			kind: "parsed",
			brief: "A zone name that exists in the zones list for the view.",
			optional: true,
			parse: String,
		},
		match: {
			kind: "enum",
			brief:
				"Whether to match all search requirements or at least one (any). If set to `all`, acts like a logical AND between filters. If set to `any`, acts like a logical OR instead.",
			values: ["any", "all"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order DNS views by.",
			values: ["name", "created_on", "modified_on"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order DNS views in.",
			values: ["asc", "desc"],
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
	describe: "List Internal DNS Views",
	usage: "$0 dns views list\n\nList DNS Internal Views for an Account",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
