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
 * @generated from apis/overlays/observability.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 observability issues list\n\nList detected issues.")
		.option("page", { type: "number", description: "Page" })
		.option("per-page", { type: "number", description: "PerPage" })
		.option("order", {
			type: "string",
			description: "Order",
			choices: ["asc", "desc"],
		})
		.option("order-by", {
			type: "string",
			description: "OrderBy",
			choices: [
				"id",
				"service",
				"title",
				"type",
				"status",
				"statusUpdated",
				"count",
				"firstObserved",
				"lastObserved",
				"created",
				"updated",
			],
		})
		.option("search", { type: "string", description: "Search" })
		.option("service", { type: "string", description: "Service" })
		.option("type", { type: "string", description: "Type" })
		.option("status", {
			type: "string",
			description: "Status",
			choices: ["active", "resolved", "ignored"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"issues.list">;
type Query = SdkQuery<"issues.list">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		"order-by": Query["orderBy"];
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List detected issues",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "observability issues list",
				classification: {
					safeFlags: ["order", "order-by", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					perPage: argv["per-page"],
					order: argv["order"],
					orderBy: argv["order-by"],
					search: argv["search"],
					service: argv["service"],
					type: argv["type"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf observability issues list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/issues`,
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
					client.observability.issues.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
