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
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-gateway logs list\n\nLists request/response log entries for the AI gateway with filtering and pagination."
		)
		.option("gateway-id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
			demandOption: true,
		})
		.option("search", {
			type: "string",
			description: "Free-text search over log metadata.",
		})
		.option("page", { type: "number", description: "Page" })
		.option("per-page", { type: "number", description: "Per page" })
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
			],
		})
		.option("order-by-direction", {
			type: "string",
			description: "Order by direction",
			choices: ["asc", "desc"],
		})
		.option("filters", { type: "string", description: "Filters" })
		.option("meta-info", { type: "boolean", description: "Meta info" })
		.option("direction", {
			type: "string",
			description: "Direction",
			choices: ["asc", "desc"],
		})
		.option("start-date", { type: "string", description: "Start date" })
		.option("end-date", { type: "string", description: "End date" })
		.option("min-cost", { type: "number", description: "Min cost" })
		.option("max-cost", { type: "number", description: "Max cost" })
		.option("min-tokens-in", { type: "number", description: "Min tokens in" })
		.option("max-tokens-in", { type: "number", description: "Max tokens in" })
		.option("min-tokens-out", { type: "number", description: "Min tokens out" })
		.option("max-tokens-out", { type: "number", description: "Max tokens out" })
		.option("min-total-tokens", {
			type: "number",
			description: "Min total tokens",
		})
		.option("max-total-tokens", {
			type: "number",
			description: "Max total tokens",
		})
		.option("min-duration", { type: "number", description: "Min duration" })
		.option("max-duration", { type: "number", description: "Max duration" })
		.option("feedback", {
			type: "string",
			description: "Feedback",
			choices: ["-1"],
		})
		.option("success", { type: "boolean", description: "Success" })
		.option("cached", { type: "boolean", description: "Cached" })
		.option("model", { type: "string", description: "Model filter." })
		.option("model-type", { type: "string", description: "Model type" })
		.option("provider", { type: "string", description: "Provider" })
		.option("request-content-type", {
			type: "string",
			description: "Request content type",
		})
		.option("response-content-type", {
			type: "string",
			description: "Response content type",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"aig-config-list-gateway-logs">;
type Query = SdkQuery<"aig-config-list-gateway-logs">;

const typedBuilder = withArgTypes<
	{
		"order-by": Query["order_by"];
		"order-by-direction": Query["order_by_direction"];
		filters: Query["filters"];
		direction: Query["direction"];
		feedback: Query["feedback"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Gateway Logs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway logs list",
				classification: {
					safeFlags: [
						"order-by",
						"order-by-direction",
						"meta-info",
						"direction",
						"feedback",
						"success",
						"cached",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					search: argv["search"],
					page: argv["page"],
					per_page: argv["per-page"],
					order_by: argv["order-by"],
					order_by_direction: argv["order-by-direction"],
					filters: argv["filters"],
					meta_info: argv["meta-info"],
					direction: argv["direction"],
					start_date: argv["start-date"],
					end_date: argv["end-date"],
					min_cost: argv["min-cost"],
					max_cost: argv["max-cost"],
					min_tokens_in: argv["min-tokens-in"],
					max_tokens_in: argv["max-tokens-in"],
					min_tokens_out: argv["min-tokens-out"],
					max_tokens_out: argv["max-tokens-out"],
					min_total_tokens: argv["min-total-tokens"],
					max_total_tokens: argv["max-total-tokens"],
					min_duration: argv["min-duration"],
					max_duration: argv["max-duration"],
					feedback: argv["feedback"],
					success: argv["success"],
					cached: argv["cached"],
					model: argv["model"],
					model_type: argv["model-type"],
					provider: argv["provider"],
					request_content_type: argv["request-content-type"],
					response_content_type: argv["response-content-type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway logs list",
						method: "GET",
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

				const result = await withProgress(`Loading`, async () =>
					client.aiGateway.logs.list({
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
