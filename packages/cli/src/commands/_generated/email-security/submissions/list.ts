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
			"$0 email-security submissions list\n\nReturns information for submissions made to reclassify emails. Shows the status, outcome, and disposition changes for reclassification requests made by users or the security team. Useful for tracking false positive/negative reports."
		)
		.option("start", {
			type: "string",
			description:
				"The beginning of the search date range. Defaults to `now - 30 days`.",
		})
		.option("end", {
			type: "string",
			description: "The end of the search date range. Defaults to `now`.",
		})
		.option("type", {
			type: "string",
			description:
				"Filter by who created the submission — `TEAM` for security team members or `USER` for end users.",
			choices: ["TEAM", "USER"],
		})
		.option("submission-id", {
			type: "string",
			description: "Filter by a specific submission ID.",
		})
		.option("original-disposition", {
			type: "string",
			description: "The disposition a message is submitted to have.",
			choices: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
		})
		.option("requested-disposition", {
			type: "string",
			description: "The disposition a message is submitted to have.",
			choices: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
		})
		.option("outcome-disposition", {
			type: "string",
			description: "The disposition a message is submitted to have.",
			choices: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
		})
		.option("status", {
			type: "string",
			description:
				"Filter by review status — `escalated`, `reviewed`, or `unreviewed`.",
		})
		.option("query", {
			type: "string",
			description: "Search term for filtering submissions.",
		})
		.option("escalated-from-user", {
			type: "boolean",
			description:
				"When true, return only submissions that were escalated by an end user (vs. by the security team). When false, return only submissions that were not escalated by an end user. When omitted, no filter is applied.",
		})
		.option("order", {
			type: "string",
			description: "Field to sort by.",
			choices: [
				"submission_id",
				"subject",
				"original_disposition",
				"requested_disposition",
				"outcome_disposition",
				"requested_at",
			],
		})
		.option("direction", {
			type: "string",
			description: "The sorting direction.",
			choices: ["asc", "desc"],
		})
		.option("page", {
			type: "number",
			description: "Current page within paginated list of results.",
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page. Maximum value is 1000.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"email_security_submissions">;
type Query = SdkQuery<"email_security_submissions">;

const typedBuilder = withArgTypes<
	{
		type: Query["type"];
		"original-disposition": Query["original_disposition"];
		"requested-disposition": Query["requested_disposition"];
		"outcome-disposition": Query["outcome_disposition"];
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List reclassify submissions",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security submissions list",
				classification: {
					safeFlags: [
						"type",
						"original-disposition",
						"requested-disposition",
						"outcome-disposition",
						"escalated-from-user",
						"order",
						"direction",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					start: argv["start"],
					end: argv["end"],
					type: argv["type"],
					submission_id: argv["submission-id"],
					original_disposition: argv["original-disposition"],
					requested_disposition: argv["requested-disposition"],
					outcome_disposition: argv["outcome-disposition"],
					status: argv["status"],
					query: argv["query"],
					escalated_from_user: argv["escalated-from-user"],
					order: argv["order"],
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security submissions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/submissions`,
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
					client.emailSecurity.submissions.list({
						account_id: accountId,
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
