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
		type: {
			kind: "enum",
			brief: "Specify the list type.",
			values: [
				"SERIAL",
				"URL",
				"DOMAIN",
				"EMAIL",
				"IP",
				"CATEGORY",
				"LOCATION",
				"DEVICE",
				"AAGUID",
			],
			optional: true,
		},
		filter: {
			kind: "parsed",
			brief:
				"Filter the returned lists by one or more `field:value` pairs.\nRepeat the parameter to apply multiple filters; they are combined with\nlogical AND (a list must satisfy every filter to be returned).\n\nSupported fields and their matching behaviour:\n  * `name` — case-insensitive substring match on the list name.\n  * `id` — substring match on the list ID (UUID), with or without dashes.\n  * `type` — exact match on the list type. Supersedes the legacy `type` query\n    parameter when both are supplied. Must be one of the valid type values.\n  * `item_count` — exact integer match on the number of items in the list.\n\nEach entry must match one of the per-field patterns below: the field must be\none of `name`, `id`, `type`, or `item_count`; `name`/`id` accept any value,\n`type` is restricted to the valid list type values, and `item_count` must be\na non-negative integer.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Case-insensitive substring match on the list name or description. When\ncombined with `filter`, both must match (logical AND).",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to sort the returned lists by. When omitted, results are ordered by\n`created_at` in ascending order (i.e. creation order) for backwards\ncompatibility. Supported values:\n  * `name` — sort alphabetically by list name.\n  * `created_at` — sort by creation time; defaults to descending unless `direction` is set.\n  * `updated_at` — sort by last-modified time; defaults to descending unless `direction` is set.\n  * `item_count` — sort by number of items in the list.",
			values: ["name", "created_at", "updated_at", "item_count"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort direction. Applies to the field named in `order_by`; when `order_by`\nis omitted it applies to the default `created_at` ordering. When\n`direction` is omitted the default is field-specific: explicitly choosing\n`created_at` or `updated_at` defaults to descending (newest first); `name`\nand `item_count` default to ascending; and the default `created_at`\nordering used when `order_by` is omitted is ascending (for backwards\ncompatibility).\n  * `asc` — ascending.\n  * `desc` — descending.",
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
	describe: "List Zero Trust lists",
	usage:
		"$0 zero-trust gateway lists list\n\nFetch all Zero Trust lists for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
