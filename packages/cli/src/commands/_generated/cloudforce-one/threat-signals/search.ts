import operation from "../../_operations/cloudforce-one/threat-signals/search.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * search command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals search\n\nSearches the account's Threat Signals articles using keyword and semantic retrieval."
		)
		.option("query", {
			type: "string",
			description:
				"Keyword and semantic article-search text, from 1 to 1000 characters.",
			demandOption: true,
		})
		.option("max-results", {
			type: "string",
			description:
				"Maximum search matches to request, an integer from 1 to 50. Defaults to 20 when omitted or empty; multiple matches from one article can produce fewer returned articles.",
		})
		.option("feed-id", {
			type: "string",
			description:
				"Optional feed UUID that restricts results to articles from that feed.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "search",
	describe: "Search Threat Signals articles using AI Search",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals search",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					query: argv["query"],
					max_results: argv["max-results"],
					feed_id: argv["feed-id"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals search",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/search`,
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
