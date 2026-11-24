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
		filter: {
			kind: "parsed",
			brief:
				"Filter the returned rules by one or more `field:value` pairs. Repeat the\nparameter to combine filters with logical AND.\n\nSupported fields are `name`, `id`, `action`, `enabled`, `source_account`,\n`is_shared`, `filters`, and `expression` (max 1024 bytes). The `source_account`\nvalue is matched as a normalized UUID substring. The `filters` value must\nbe one of the rule filter names and matches a member of the rule's `filters`\narray. The `expression` filter performs a case-insensitive literal\nsubstring match across traffic, identity, and device posture expressions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Case-insensitive substring search across rule name and description.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to sort the returned rules by. Supported values are `name`,\n`created_at`, `updated_at`, and `precedence`.",
			values: ["name", "created_at", "updated_at", "precedence"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort direction. When `order_by` is omitted, this controls the direction\nof the existing precedence ordering. Shared rules remain first in either\ndirection. Accepted values are `asc` and `desc`.",
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
	describe: "List Zero Trust Gateway rules",
	usage:
		"$0 zero-trust gateway rules list\n\nList Zero Trust Gateway rules for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
