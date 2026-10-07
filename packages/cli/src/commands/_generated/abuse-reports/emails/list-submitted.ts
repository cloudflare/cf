import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list-submitted command
 * @generated from apis/overlays/abuse-reports.ts
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
			"$0 abuse-reports emails list-submitted <report-id>\n\nList successful emails sent to the submitter of a report submitted by the account. Does not include emails sent to customers or hosts."
		)
		.positional("report-id", {
			type: "string",
			description: "Public report code.",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Page number to retrieve (default 1).",
		})
		.option("per-page", {
			type: "number",
			description: "Number of emails per page (default 20, max 100).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ListSubmittedAbuseReportEmails">;
type Query = SdkQuery<"ListSubmittedAbuseReportEmails">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list-submitted <report-id>",
	describe: "List emails sent to an abuse report submitter",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "abuse-reports emails list-submitted",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports emails list-submitted",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/submitted/${argv["report-id"] == null ? "<report-id>" : encodeURIComponent(String(argv["report-id"]))}/emails`,
						pathParams: { "report-id": String(argv["report-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.abuseReports.emails.listSubmitted({
						account_id: accountId,
						report_id: argv["report-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
