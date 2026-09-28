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
 * @generated from apis/overlays/matches.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 matches download get\n\nReturn matches as CSV for string queries based on ID"
		)
		.option("id", { type: "string", description: "ID" })
		.option("offset", { type: "number", description: "Offset" })
		.option("limit", { type: "number", description: "Limit" })
		.option("include-domain-id", {
			type: "boolean",
			description: "Include domain ID",
		})
		.option("include-dismissed", {
			type: "boolean",
			description: "Include dismissed",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"getAccountsAccountIdBrandProtectionMatchesDownload">;
type Query = SdkQuery<"getAccountsAccountIdBrandProtectionMatchesDownload">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Download matches for string queries by ID",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "matches download get",
				classification: {
					safeFlags: ["include-domain-id", "include-dismissed", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					id: argv["id"],
					offset: argv["offset"],
					limit: argv["limit"],
					include_domain_id: argv["include-domain-id"],
					include_dismissed: argv["include-dismissed"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf matches download get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/brand-protection/matches/download`,
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
					client.matches.download.get({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
