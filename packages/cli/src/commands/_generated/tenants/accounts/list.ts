import operation from "../../_operations/tenants/accounts/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/tenants.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 tenants accounts list\n\nLists all Cloudflare accounts across this tenant's hierarchy using the legacy Account response shape. Use `GET /organizations/{organization_id}/accounts` to list only accounts immediately attached to a specific Organization using the modern Account response shape. Use `page_token` and `page_size` for cursor pagination."
		)
		.option("tenant-id", {
			type: "string",
			description: "The ID of the tenant whose accounts to list.",
			demandOption: true,
		})
		.option("account-pubname", {
			type: "string",
			description:
				"(case-sensitive) Filter the list of accounts to where the account_pubname is equal to\na particular string.",
		})
		.option("account-pubname-starts-with", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of accounts to where the account_pubname starts with\na particular string.",
		})
		.option("account-pubname-ends-with", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of accounts to where the account_pubname ends with\na particular string.",
		})
		.option("account-pubname-contains", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of accounts to where the account_pubname contains\na particular string.",
		})
		.option("name", {
			type: "string",
			description:
				"(case-sensitive) Filter the list of accounts to where the name is equal to a\nparticular string. At most one of `name`, `name.startsWith`, `name.endsWith`,\nor `name.contains` may be supplied per request.",
		})
		.option("name-starts-with", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of accounts to where the name starts with a\nparticular string.",
		})
		.option("name-ends-with", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of accounts to where the name ends with a particular\nstring.",
		})
		.option("name-contains", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of accounts to where the name contains a particular\nstring.",
		})
		.option("status", {
			type: "string",
			description: "Filter accounts by lifecycle status. Defaults to `active`.",
			choices: ["active", "deleted"],
		})
		.option("order-by", {
			type: "string",
			description:
				"Field to order results by. Currently supported values: `account_name`.",
			choices: ["account_name"],
		})
		.option("direction", {
			type: "string",
			description:
				"Sort direction for the order_by field. Valid values: `asc`, `desc`.\nDefaults to `asc` when order_by is specified.",
			choices: ["asc", "desc"],
		})
		.option("include-total", {
			type: "boolean",
			description:
				"Whether to calculate and return the exact `result_info.total_size` for cursor\npagination. Defaults to true. When false, `total_size` is omitted.",
		})
		.option("page-token", {
			type: "string",
			description:
				"An opaque token returned from the last list response that when\nprovided will retrieve the next page.\n\nParameters used to filter the retrieved list must remain in subsequent\nrequests with a page token.",
		})
		.option("page-size", {
			type: "number",
			description: "The amount of items to return. Defaults to 10.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List tenant accounts",
	builder,
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
				} satisfies ArgClassification<Args>,
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
};

export default command;
