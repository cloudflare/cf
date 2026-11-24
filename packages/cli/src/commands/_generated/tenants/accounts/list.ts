/**
 * list command
 * @generated from apis/overlays/tenants.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tenant-id": {
			kind: "parsed",
			brief: "The ID of the tenant whose accounts to list.",
			parse: String,
		},
		"account-pubname": {
			kind: "parsed",
			brief:
				"(case-sensitive) Filter the list of accounts to where the account_pubname is equal to\na particular string.",
			optional: true,
			parse: String,
		},
		"account-pubname-starts-with": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of accounts to where the account_pubname starts with\na particular string.",
			optional: true,
			parse: String,
		},
		"account-pubname-ends-with": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of accounts to where the account_pubname ends with\na particular string.",
			optional: true,
			parse: String,
		},
		"account-pubname-contains": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of accounts to where the account_pubname contains\na particular string.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"(case-sensitive) Filter the list of accounts to where the name is equal to a\nparticular string. At most one of `name`, `name.startsWith`, `name.endsWith`,\nor `name.contains` may be supplied per request.",
			optional: true,
			parse: String,
		},
		"name-starts-with": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of accounts to where the name starts with a\nparticular string.",
			optional: true,
			parse: String,
		},
		"name-ends-with": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of accounts to where the name ends with a particular\nstring.",
			optional: true,
			parse: String,
		},
		"name-contains": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of accounts to where the name contains a particular\nstring.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter accounts by lifecycle status. Defaults to `active`.",
			values: ["active", "deleted"],
			optional: true,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to order results by. Currently supported values: `account_name`.",
			values: ["account_name"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort direction for the order_by field. Valid values: `asc`, `desc`.\nDefaults to `asc` when order_by is specified.",
			values: ["asc", "desc"],
			optional: true,
		},
		"include-total": {
			kind: "boolean",
			brief:
				"Whether to calculate and return the exact `result_info.total_size` for cursor\npagination. Defaults to true. When false, `total_size` is omitted.",
			optional: true,
		},
		"page-token": {
			kind: "parsed",
			brief:
				"An opaque token returned from the last list response that when\nprovided will retrieve the next page.\n\nParameters used to filter the retrieved list must remain in subsequent\nrequests with a page token.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief: "The amount of items to return. Defaults to 10.",
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
	describe: "List tenant accounts",
	usage:
		"$0 tenants accounts list\n\nLists all Cloudflare accounts across this tenant's hierarchy using the legacy Account response shape. Use `GET /organizations/{organization_id}/accounts` to list only accounts immediately attached to a specific Organization using the modern Account response shape. Use `page_token` and `page_size` for cursor pagination.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
