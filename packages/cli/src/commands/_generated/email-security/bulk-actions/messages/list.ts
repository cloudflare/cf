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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security bulk-actions messages list\n\nReturns the individual messages associated with a bulk action job, including their processing status."
		)
		.option("job-id", {
			type: "string",
			description: "Identifier of the bulk action job whose messages to list.",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Current page within paginated list of results.",
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page. Maximum value is 1000.",
		})
		.option("status", {
			type: "string",
			description: "Filter the job's messages by their processing status.",
			choices: [
				"PENDING",
				"PROCESSING",
				"COMPLETED",
				"FAILED",
				"CANCELLED",
				"SKIPPED",
			],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"email_security_get_bulk_job_messages">;
type Query = SdkQuery<"email_security_get_bulk_job_messages">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List messages for a bulk action job",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security bulk-actions messages list",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security bulk-actions messages list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/bulk/${argv["job-id"] == null ? "<job-id>" : encodeURIComponent(String(argv["job-id"]))}/messages`,
						pathParams: { "job-id": String(argv["job-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.emailSecurity.bulkActions.messages.list({
						account_id: accountId,
						job_id: argv["job-id"],
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
