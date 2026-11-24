/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief:
				"Selects namespaces. Repeat the parameter to select multiple namespaces (for example, namespace=foo&namespace=bar).",
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief:
				"Selects paths with exact-match semantics. Omit the parameter to return rules from all paths. Pass an empty string (path=) to return only rules with an empty or uncategorized path. Pass a value (for example, path=yara) to match that exact path. Repeat the parameter (for example, path=yara&path=expr) to OR-match multiple paths with SQL `IN (...)` semantics. The `recursive` flag affects only customer-account namespace selection.",
			optional: true,
			parse: String,
		},
		recursive: {
			kind: "enum",
			brief:
				"For customer accounts, true enables descendant matching for namespaces. Paths always use exact matching.",
			values: ["true", "false"],
			optional: true,
		},
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		"is-public": {
			kind: "enum",
			brief: "Limits rules to the specified public visibility.",
			values: ["true", "false"],
			optional: true,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
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
	describe: "List rules",
	usage:
		"$0 cloudforce-one rules list\n\nReturns all rules for an account with optional filtering.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
