import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
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
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 brand-protection matches get\n\nGet paginated list of domain matches for one or more brand protection queries. When multiple query_ids are provided (comma-separated), matches are deduplicated across queries and each match includes a match_details array with per-match query metadata and individual dismissed state."
		)
		.option("offset", { type: "string", description: "Offset" })
		.option("limit", { type: "string", description: "Limit" })
		.option("query-id", {
			type: "string",
			description:
				"Query ID or comma-separated list of Query IDs. When multiple IDs are provided, matches are deduplicated across queries and each match includes a match_details array with per-match query metadata and dismissed state.",
			demandOption: true,
		})
		.option("include-domain-id", {
			type: "string",
			description: "Include domain ID",
		})
		.option("include-dismissed", {
			type: "string",
			description: "Include dismissed",
		})
		.option("domain-search", {
			type: "string",
			description: "Filter matches by domain name (substring match)",
		})
		.option("order-by", {
			type: "string",
			description:
				"Column to sort by. Options: 'domain', 'first_seen', or 'registrar'",
			choices: ["domain", "first_seen", "registrar"],
		})
		.option("order", {
			type: "string",
			description:
				"Sort order. Options: 'asc' (ascending) or 'desc' (descending)",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_DomainMatchList">;
type Query = SdkQuery<"get_DomainMatchList">;

const typedBuilder = withArgTypes<
	{
		"order-by": Query["orderBy"];
		order: Query["order"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "List saved query matches",
	builder: typedBuilder,
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
				const queryParams: Query = {
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
					client.brandProtection.matches.get({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
