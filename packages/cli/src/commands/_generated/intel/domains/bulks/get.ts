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
 * get command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel domains bulks get\n\nReturns security details and statistics about multiple domains in a single request. **Behavior change — domain ranking is becoming opt-in.** This endpoint previously included domain ranking data in every response and accepted a `skip_ranking=true` query parameter to opt out. That parameter is being deprecated and ranking will no longer be returned by default. Callers that want ranking data must pass `include_ranking=true`. The `skip_ranking` parameter will be silently ignored once the change ships."
		)
		.option("domain", {
			type: "string",
			description:
				"Accepts multiple values like `?domain=cloudflare.com&domain=example.com`.",
		})
		.option("include-ranking", {
			type: "boolean",
			description:
				"Whether to include domain ranking data in the response. Defaults to\n`false` — ranking lookups are expensive at bulk scale and most\ncallers do not need them. Set to `true` to opt in. This parameter\nreplaces the deprecated `skip_ranking` (see below).",
		})
		.option("skip-ranking", {
			type: "boolean",
			description:
				"**Deprecated.** Previously controlled whether the ranking lookup\nwas skipped (defaulted to `false`, meaning ranking ran). The\nendpoint's default behavior is being flipped — ranking is now\nopt-in via `include_ranking=true` — and this parameter will be\nsilently ignored. Remove it from your callers and use\n`include_ranking` instead.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"domain-intelligence-get-multiple-domain-details">;
type Query = SdkQuery<"domain-intelligence-get-multiple-domain-details">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get Multiple Domain Details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel domains bulks get",
				classification: {
					safeFlags: ["include-ranking", "skip-ranking", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					domain: argv["domain"],
					include_ranking: argv["include-ranking"],
					skip_ranking: argv["skip-ranking"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel domains bulks get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/domain/bulk`,
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
					client.intel.domains.bulks.get({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
