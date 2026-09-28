import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * logs command
 * @generated from apis/overlays/ai-search.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-search items logs <item-id>\n\nLists processing logs for a specific item in an AI Search instance."
		)
		.positional("item-id", {
			type: "string",
			description: "Indexed item ID.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "Namespace to use for this operation.",
			demandOption: true,
		})
		.option("id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("limit", { type: "number", description: "Limit" })
		.option("cursor", { type: "string", description: "Cursor" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ai-search-namespace-instance-logs-item">;
type Query = SdkQuery<"ai-search-namespace-instance-logs-item">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "logs <item-id>",
	describe: "Item Logs.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search items logs",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search items logs",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/instances/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/items/${argv["item-id"] == null ? "<item-id>" : encodeURIComponent(String(argv["item-id"]))}/logs`,
						pathParams: {
							id: String(argv["id"] ?? ""),
							"item-id": String(argv["item-id"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.aiSearch.items.logs({
						account_id: accountId,
						name: argv["name"],
						id: argv["id"],
						item_id: argv["item-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
