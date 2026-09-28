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
			"$0 intel domains get\n\nGets security details and statistics about a domain."
		)
		.option("domain", { type: "string", description: "Domain" })
		.option("skip-dns", {
			type: "boolean",
			description: "Skip DNS resolution lookups for faster response.",
		})
		.option("skip-ranking", {
			type: "boolean",
			description:
				"Skip the domain ranking lookup for faster responses. Defaults to\n`false` (ranking is included). Set to `true` to opt out — primarily\nused by callers like Cloudflare Radar that need to avoid a\ncircular dependency when building the domain details page.\nNote: the bulk endpoint (`/intel/domain/bulk`) uses opposite\ndefaults — see `include_ranking` there.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"domain-intelligence-get-domain-details">;
type Query = SdkQuery<"domain-intelligence-get-domain-details">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get Domain Details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel domains get",
				classification: {
					safeFlags: ["skip-dns", "skip-ranking", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					domain: argv["domain"],
					skip_dns: argv["skip-dns"],
					skip_ranking: argv["skip-ranking"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel domains get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/domain`,
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
					client.intel.domains.get({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
