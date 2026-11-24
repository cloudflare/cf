/**
 * list command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		status: {
			kind: "enum",
			brief: "Filter shares by status.",
			values: ["active", "deleting", "deleted"],
			optional: true,
		},
		kind: {
			kind: "enum",
			brief: "Filter shares by kind.",
			values: ["sent", "received"],
			optional: true,
		},
		"target-type": {
			kind: "enum",
			brief: "Filter shares by target_type.",
			values: ["account", "organization"],
			optional: true,
		},
		"resource-types": {
			kind: "parsed",
			brief: "Filter share resources by resource_types.",
			variadic: true,
			optional: true,
			choices: [
				"custom-ruleset",
				"gateway-policy",
				"gateway-destination-ip",
				"gateway-block-page-settings",
				"gateway-extended-email-matching",
				"idp-federation-grant",
				"trust-grant",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		order: {
			kind: "enum",
			brief: "Order shares by values in the given field.",
			values: ["name", "created"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to sort objects.",
			values: ["asc", "desc"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number. Defaults to `1` when omitted.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of objects to return per page. Defaults to `20` when omitted.",
			optional: true,
			parse: Number,
		},
		"include-resources": {
			kind: "boolean",
			brief: "Include resources in the response.",
			optional: true,
		},
		"include-recipient-counts": {
			kind: "boolean",
			brief: "Include recipient counts in the response.",
			optional: true,
		},
		"include-tags-from": {
			kind: "enum",
			brief:
				"Include share tags in the response. `api` reads tags from the tag service; `mirror` reads a local, eventually consistent replica. If the tag lookup fails, the response omits `tags`.",
			values: ["api", "mirror"],
			optional: true,
		},
		tag: {
			kind: "parsed",
			brief:
				"Filter shares by tag. Each value is either `key=value` (matches shares whose tags contain that key/value pair) or `key` alone (matches shares that have any value for that key). May be repeated; multiple `tag` parameters are ANDed together. Maximum 20 `tag` parameters per request.",
			variadic: true,
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
	describe: "List account shares",
	usage: "$0 resource-sharing list\n\nLists all account shares.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
