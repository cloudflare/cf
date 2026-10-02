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
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals indicators list\n\nLists indicators of compromise extracted from the account's Threat Signals articles."
		)
		.option("feed-id", { type: "string", description: "Feed ID" })
		.option("article-id", { type: "string", description: "Article ID" })
		.option("search", {
			type: "string",
			description:
				"NFC-normalized and trimmed, case-insensitive literal substring search of indicator values. Requires 3–500 Unicode code points; the upper code-point bound is described here because OpenAPI string length cannot precisely express it without imposing UTF-16 semantics.",
		})
		.option("per-page", { type: "number", description: "Per page" })
		.option("sort", { type: "string", description: "Sort" })
		.option("include-total", { type: "boolean", description: "Include total" })
		.option("cursor", { type: "string", description: "Cursor" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"rssArticleIndicatorList">;
type Query = SdkQuery<"rssArticleIndicatorList">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Threat Signals article indicators",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals indicators list",
				classification: {
					safeFlags: ["include-total", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					feed_id: argv["feed-id"],
					article_id: argv["article-id"],
					search: argv["search"],
					per_page: argv["per-page"],
					sort: argv["sort"],
					include_total: argv["include-total"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals indicators list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/indicators`,
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
					client.cloudforceOne.threatSignals.indicators.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
