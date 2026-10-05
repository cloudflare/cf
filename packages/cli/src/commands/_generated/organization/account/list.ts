import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization account list\n\nRetrieve the accounts immediately attached to a specific organization. Accounts attached to sub-organizations are not included. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.option("organization-id", {
			type: "string",
			description:
				"The ID of the organization to retrieve a list of accounts for.",
			demandOption: true,
		})
		.option("account-pubname", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of accounts to where the account_pubname is equal to\na particular string.",
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
				"(case-insensitive) Filter the list of accounts to where the name is equal to a\nparticular string.",
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
		.option("order-by", {
			type: "string",
			description:
				"Field to order results by. Currently supported values: `account_name`.\nWhen not specified, results are ordered by internal account ID.",
			choices: ["account_name"],
		})
		.option("direction", {
			type: "string",
			description:
				"Sort direction for the order_by field. Valid values: `asc`, `desc`.\nDefaults to `asc` when order_by is specified.",
			choices: ["asc", "desc"],
		})
		.option("include-tags", {
			type: "boolean",
			description:
				"Include Account tags from the resource tag mirror. Omit this parameter to preserve the existing Account response shape.",
		})
		.option("include-total", {
			type: "boolean",
			description:
				"Whether to calculate and return the exact result_info.total_size for cursor\npagination. Defaults to true. When false, total_size is omitted. page_size and\ninclude_total may change between pages; next_page_token remains the authoritative\ncontinuation signal.\nLegacy page/per_page requests always calculate total_count.",
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

type Request = SdkRequest<"Organizations_getAccounts">;
type Query = SdkQuery<"Organizations_getAccounts">;

const typedBuilder = withArgTypes<
	{
		"order-by": Query["order_by"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List organization accounts",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization account list",
				classification: {
					safeFlags: [
						"order-by",
						"direction",
						"include-tags",
						"include-total",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					account_pubname: argv["account-pubname"],
					"account_pubname.startsWith": argv["account-pubname-starts-with"],
					"account_pubname.endsWith": argv["account-pubname-ends-with"],
					"account_pubname.contains": argv["account-pubname-contains"],
					name: argv["name"],
					"name.startsWith": argv["name-starts-with"],
					"name.endsWith": argv["name-ends-with"],
					"name.contains": argv["name-contains"],
					order_by: argv["order-by"],
					direction: argv["direction"],
					include_tags: argv["include-tags"],
					include_total: argv["include-total"],
					page_token: argv["page-token"],
					page_size: argv["page-size"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization account list",
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
					client.organization.account.list({
						organization_id: argv["organization-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
