import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * sync command
 * @generated from apis/overlays/ai-search.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-search items sync <item-id>\n\nSyncs an item to an AI Search instance index."
		)
		.positional("item-id", {
			type: "string",
			description: "Indexed item ID.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description: "Namespace to use for this operation.",
			demandOption: true,
		})
		.option("instance-id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("next-action", {
			type: "string",
			description: "The next_action field",
			choices: ["INDEX"],
		})
		.option("wait-for-completion", {
			type: "boolean",
			description:
				"Wait for indexing before responding. After processing, vector-indexed instances use any time remaining in a 25s wait budget to confirm Vectorize ingestion. Processing itself is not interrupted and can exceed that budget. If confirmation times out, the current item state is returned and background indexing continues. Defaults to false.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ai-search-namespace-instance-sync-item">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "sync <item-id>",
	describe: "Sync Item.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search items sync",
				classification: {
					safeFlags: ["next-action", "wait-for-completion", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search items sync",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/items/${argv["item-id"] == null ? "<item-id>" : encodeURIComponent(String(argv["item-id"]))}`,
						pathParams: {
							"instance-id": String(argv["instance-id"] ?? ""),
							"item-id": String(argv["item-id"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										next_action: resolveFileToken(
											argv["next-action"] as string | undefined,
											"next-action",
											"text"
										),
										wait_for_completion: argv["wait-for-completion"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.aiSearch.items.sync({
							...bodyData,
							account_id: accountId,
							namespace: argv["namespace"],
							"instance-id": argv["instance-id"],
							item_id: argv["item-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["next-action"] === undefined) {
					argv["next-action"] = await promptForRequiredEnumField(
						"next-action",
						"The next_action field",
						["INDEX"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					next_action: resolveFileToken(
						argv["next-action"] as string | undefined,
						"next-action",
						"text"
					),
					wait_for_completion: argv["wait-for-completion"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.aiSearch.items.sync({
						...bodyData,
						account_id: accountId,
						namespace: argv["namespace"],
						"instance-id": argv["instance-id"],
						item_id: argv["item-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
