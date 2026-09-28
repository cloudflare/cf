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
import type { SdkRequest } from "#sdk";
/**
 * eligibility command
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 abuse-reports appeals eligibility <report-id>\n\nReturns whether the report is currently appealable, along with the signals behind that decision: whether it already has an open appeal, how many appeals have been submitted against it, and whether it has at least one mitigation that an appeal could reverse."
		)
		.positional("report-id", {
			type: "string",
			description: "Abuse Report ID",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"CheckAppealEligibility">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "eligibility <report-id>",
	describe: "Check whether a report can be appealed",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "abuse-reports appeals eligibility",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports appeals eligibility",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/${argv["report-id"] == null ? "<report-id>" : encodeURIComponent(String(argv["report-id"]))}/appeals/eligibility`,
						pathParams: { "report-id": String(argv["report-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.abuseReports.appeals.eligibility({
						account_id: accountId,
						report_id: argv["report-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
