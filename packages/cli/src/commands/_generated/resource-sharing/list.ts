import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/resource-sharing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 resource-sharing list\n\nLists all account shares.")
		.option("status", {
			type: "string",
			description: "Filter shares by status.",
			choices: ["active", "deleting", "deleted"],
		})
		.option("kind", {
			type: "string",
			description: "Filter shares by kind.",
			choices: ["sent", "received"],
		})
		.option("target-type", {
			type: "string",
			description: "Filter shares by target_type.",
			choices: ["account", "organization"],
		})
		.option("resource-types", {
			type: "string",
			description: "Filter share resources by resource_types.",
		})
		.option("order", {
			type: "string",
			description: "Order shares by values in the given field.",
			choices: ["name", "created"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to sort objects.",
			choices: ["asc", "desc"],
		})
		.option("page", {
			type: "number",
			description:
				"Page number. Defaults to `1` when `per_page` is supplied without\n`page`. May be omitted entirely along with `per_page` to receive a\nnon-paginated response.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of objects to return per page. Defaults to `20` when `page`\nis supplied without `per_page`. May be omitted entirely along with\n`page` to receive a non-paginated response.",
		})
		.option("include-resources", {
			type: "boolean",
			description: "Include resources in the response.",
		})
		.option("include-recipient-counts", {
			type: "boolean",
			description: "Include recipient counts in the response.",
		})
		.option("tag", {
			type: "string",
			description:
				"Filter shares by tag. Each value is either `key=value` (matches shares whose tags contain that key/value pair) or `key` alone (matches shares that have any value for that key). May be repeated; multiple `tag` parameters are ANDed together. Maximum 20 `tag` parameters per request.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"shares-list">;
type Query = SdkQuery<"shares-list">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		kind: Query["kind"];
		"target-type": Query["target_type"];
		"resource-types": Query["resource_types"];
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List account shares",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing list",
				classification: {
					safeFlags: [
						"status",
						"kind",
						"target-type",
						"order",
						"direction",
						"include-resources",
						"include-recipient-counts",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					status: argv["status"],
					kind: argv["kind"],
					target_type: argv["target-type"],
					resource_types: argv["resource-types"],
					order: argv["order"],
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
					include_resources: argv["include-resources"],
					include_recipient_counts: argv["include-recipient-counts"],
					tag: argv["tag"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.resourceSharing.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
