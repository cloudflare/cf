import operation from "../../_operations/brand-protection/logo-matches/get.js";
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
			"$0 brand-protection logo-matches get\n\nLists images that matched a saved logo query, most recently matched first by default. Set `download=true` to include each matched image as base64 data."
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
			description: "ID of the logo query whose matches to list.",
			demandOption: true,
		})
		.option("download", {
			type: "string",
			description:
				"Set to `true` to include each matched image as base64 data in `image_data`, with its MIME type in `content_type`.",
		})
		.option("order-by", {
			type: "string",
			description:
				"Field to sort by: `matchedAt`, `domain`, `similarityScore`, or `registrar`. Defaults to `matchedAt`.",
			choices: ["matchedAt", "domain", "similarityScore", "registrar"],
		})
		.option("order", {
			type: "string",
			description: "Sort direction: `asc` or `desc`. Defaults to `desc`.",
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
	describe: "List logo matches",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "brand-protection logo-matches get",
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
					download: argv["download"],
					orderBy: argv["order-by"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection logo-matches get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/logo/matches`,
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
