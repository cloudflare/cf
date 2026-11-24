import operation from "../../_operations/tenants/accounts/list.js";
/**
 * list command
 * @generated from apis/overlays/tenants.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List tenant accounts",
	usage:
		"$0 tenants accounts list\n\nLists all Cloudflare accounts across this tenant's hierarchy using the legacy Account response shape. Use `GET /organizations/{organization_id}/accounts` to list only accounts immediately attached to a specific Organization using the modern Account response shape. Use `page_token` and `page_size` for cursor pagination.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenants accounts list",
				classification: {
					safeFlags: [
						"status",
						"order-by",
						"direction",
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
					include_total: argv["include-total"],
					page_token: argv["page-token"],
					page_size: argv["page-size"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf tenants accounts list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-id"] == null ? "<tenant-id>" : encodeURIComponent(String(argv["tenant-id"]))}/accounts`,
						pathParams: { "tenant-id": String(argv["tenant-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						tenant_id: argv["tenant-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
