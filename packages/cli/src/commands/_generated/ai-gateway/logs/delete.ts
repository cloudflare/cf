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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-gateway logs delete <gateway-id>\n\nDeletes gateway log entries matching the specified criteria."
		)
		.positional("gateway-id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
			demandOption: true,
		})
		.option("order-by", {
			type: "string",
			description: "Order by",
			choices: [
				"created_at",
				"provider",
				"model",
				"model_type",
				"success",
				"cached",
				"cost",
				"tokens_in",
				"tokens_out",
				"duration",
				"feedback",
			],
		})
		.option("order-by-direction", {
			type: "string",
			description: "Order by direction",
			choices: ["asc", "desc"],
		})
		.option("filters", { type: "string", description: "Filters" })
		.option("limit", { type: "number", description: "Limit" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Request = SdkRequest<"aig-config-delete-gateway-logs">;
type Query = SdkQuery<"aig-config-delete-gateway-logs">;

const typedBuilder = withArgTypes<
	{
		"order-by": Query["order_by"];
		"order-by-direction": Query["order_by_direction"];
		filters: Query["filters"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <gateway-id>",
	describe: "Delete Gateway Logs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway logs delete",
				classification: {
					safeFlags: ["order-by", "order-by-direction", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					order_by: argv["order-by"],
					order_by_direction: argv["order-by-direction"],
					filters: argv["filters"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway logs delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/logs`,
						pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This permanently deletes every stored log entry on the gateway that matches the filters. Deleted logs cannot be recovered.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.aiGateway.logs.delete({
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
