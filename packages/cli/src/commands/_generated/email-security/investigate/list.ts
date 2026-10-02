import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
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
			"$0 email-security investigate list\n\nReturns information for each email that matches the provided search parameters."
		)
		.option("start", {
			type: "string",
			description:
				"The beginning of the search date range. Defaults to `now - 30 days`. Must not be in the future.",
		})
		.option("end", {
			type: "string",
			description: "The end of the search date range. Defaults to `now`.",
		})
		.option("query", {
			type: "string",
			description:
				"Space-delimited term matched case-insensitively against message metadata — sender, recipient, subject, attachment names and hashes, and message ID.",
		})
		.option("detections-only", {
			type: "boolean",
			description: "Whether to include only detections in search results.",
		})
		.option("final-disposition", {
			type: "string",
			description: "Dispositions to filter by.",
			choices: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
		})
		.option("metric", {
			type: "string",
			description: "Metric to aggregate the results by.",
		})
		.option("message-action", {
			type: "string",
			description: "Message actions to filter by.",
			choices: ["PREVIEW", "QUARANTINE_RELEASED", "MOVED"],
		})
		.option("recipient", {
			type: "string",
			description: "Filter by recipient. Matches an email address or a domain.",
		})
		.option("sender", {
			type: "string",
			description: "Filter by sender. Matches an email address or a domain.",
		})
		.option("smtp-helo-ip", {
			type: "string",
			description:
				"Matches messages whose SMTP HELO server IP address equals this value.",
		})
		.option("alert-id", { type: "string", description: "Filter by alert ID." })
		.option("domain", {
			type: "string",
			description:
				"Filter by a domain found in the email — sender domain, recipient domain, or a domain in a link.",
		})
		.option("message-id", {
			type: "string",
			description: "Filter by the RFC 5322 Message-ID header.",
		})
		.option("subject", {
			type: "string",
			description:
				"Search for messages containing individual keywords in any order within the subject.",
		})
		.option("delivery-status", {
			type: "string",
			description: "Delivery status to filter by.",
			choices: [
				"delivered",
				"moved",
				"quarantined",
				"rejected",
				"deferred",
				"bounced",
				"queued",
				"move_failed",
			],
		})
		.option("cursor", {
			type: "string",
			description:
				"Pagination cursor from the previous response's `result_info`.",
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page. Maximum value is 1000.",
		})
		.option("page", {
			type: "number",
			description:
				"Deprecated: Use cursor pagination instead. End of life: November 1, 2026.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"email_security_investigate">;
type Query = SdkQuery<"email_security_investigate">;

const typedBuilder = withArgTypes<
	{
		"final-disposition": Query["final_disposition"];
		"message-action": Query["message_action"];
		"delivery-status": Query["delivery_status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Search email messages",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security investigate list",
				classification: {
					safeFlags: [
						"detections-only",
						"final-disposition",
						"message-action",
						"delivery-status",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					start: argv["start"],
					end: argv["end"],
					query: argv["query"],
					detections_only: argv["detections-only"],
					final_disposition: argv["final-disposition"],
					metric: argv["metric"],
					message_action: argv["message-action"],
					recipient: argv["recipient"],
					sender: argv["sender"],
					smtp_helo_ip: argv["smtp-helo-ip"],
					alert_id: argv["alert-id"],
					domain: argv["domain"],
					message_id: argv["message-id"],
					subject: argv["subject"],
					delivery_status: argv["delivery-status"],
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security investigate list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate`,
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
					client.emailSecurity.investigate.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
