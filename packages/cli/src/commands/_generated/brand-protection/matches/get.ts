import operation from "../../_operations/brand-protection/matches/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/brand-protection.ts
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
			"$0 brand-protection matches get\n\nLists domains that matched one or more saved domain queries, most recently matched first by default. When you pass several comma-separated `query_id` values, matches are deduplicated by domain and each match includes a `match_details` array with per-query dismissed state. Set `include_domain_id=true` to get the `domain_id` needed to dismiss or undismiss a match."
		)
		.option("offset", {
			type: "string",
			description: "Number of matches to skip, for pagination. Defaults to 0.",
		})
		.option("limit", {
			type: "string",
			description: "Maximum number of matches to return. Defaults to 50.",
		})
		.option("query-id", {
			type: "string",
			array: true,
			description:
				"ID of a domain query, or a comma-separated list of domain query IDs. When you pass several IDs, matches are deduplicated by domain and each match includes a `match_details` array with per-query metadata and dismissed state.",
			demandOption: true,
		})
		.option("include-domain-id", {
			type: "string",
			description:
				"Set to `true` to include `domain_id` on each match. Required to dismiss or undismiss a match. Defaults to `false`.",
		})
		.option("include-dismissed", {
			type: "string",
			description:
				"Set to `false` to exclude dismissed matches. Dismissed matches are included when this is omitted or `true`.",
		})
		.option("domain-search", {
			type: "string",
			description:
				"Return only matches whose domain contains this text (case-insensitive).",
		})
		.option("order-by", {
			type: "string",
			description:
				"Field to sort by: `domain`, `first_seen`, or `registrar`. Defaults to `first_seen`.",
			choices: ["domain", "first_seen", "registrar"],
		})
		.option("order", {
			type: "string",
			description:
				"Sort direction: `asc` or `desc`. Defaults to `desc`. For single-query requests, `asc` applies only when `orderBy` is set.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "List domain matches",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "brand-protection matches get",
				classification: {
					safeFlags: ["order-by", "order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					offset: argv["offset"],
					limit: argv["limit"],
					query_id: argv["query-id"],
					include_domain_id: argv["include-domain-id"],
					include_dismissed: argv["include-dismissed"],
					domain_search: argv["domain-search"],
					orderBy: argv["order-by"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection matches get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/domain/matches`,
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
