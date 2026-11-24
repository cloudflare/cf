/**
 * list command
 * @generated from apis/overlays/organizations.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, requestApi } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List organization accounts",
	usage:
		"$0 organizations accounts list\n\nRetrieve the accounts immediately attached to a specific organization. Accounts attached to sub-organizations are not included. Use `page_token` and `page_size` for cursor pagination. The default response uses Account fields; `Accept: application/json; legacy=true` requests the LegacyAccount representation.",
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "The ID of the organization to retrieve a list of accounts for.",
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
		"include-tags": {
			kind: "boolean",
			brief:
				"Include Account tags from the resource tag mirror. Omit this parameter to preserve the existing Account response shape.",
			optional: true,
		},
		"include-total": {
			kind: "boolean",
			brief:
				"Whether to calculate and return the exact result_info.total_size for cursor\npagination. Defaults to true. When false, total_size is omitted. page_size and\ninclude_total may change between pages; next_page_token remains the authoritative\ncontinuation signal.",
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
		accept: {
			kind: "parsed",
			brief:
				"Request `application/json; legacy=true` for the LegacyAccount representation.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations accounts list",
				classification: {
					safeFlags: [
						"status",
						"order-by",
						"direction",
						"include-tags",
						"include-total",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					account_pubname: argv["account-pubname"],
					"account_pubname.startsWith": argv["account-pubname-starts-with"],
					"account_pubname.endsWith": argv["account-pubname-ends-with"],
					"account_pubname.contains": argv["account-pubname-contains"],
					name: argv["name"],
					"name.startsWith": argv["name-starts-with"],
					"name.endsWith": argv["name-ends-with"],
					"name.contains": argv["name-contains"],
					status: argv["status"],
					order_by: argv["order-by"],
					direction: argv["direction"],
					include_tags: argv["include-tags"],
					include_total: argv["include-total"],
					page_token: argv["page-token"],
					page_size: argv["page-size"],
				};

				const headers: Record<string, string> = {};
				if (argv["accept"] !== undefined)
					headers["Accept"] = String(argv["accept"]);
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations accounts list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/accounts`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(
						client,
						"GET",
						`/organizations/${encodeURIComponent(String(argv["organization-id"]))}/accounts`,
						{
							query: queryParams,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
