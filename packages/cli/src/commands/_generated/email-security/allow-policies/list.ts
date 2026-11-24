import operation from "../../_operations/email-security/allow-policies/list.js";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "list",
	describe: "List email allow policies",
	usage:
		"$0 email-security allow-policies list\n\nReturns a paginated list of email allow policies. These policies exempt matching emails from security detection, allowing them to bypass disposition actions. Supports filtering by pattern type and policy attributes.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search term for filtering records. Behavior may change.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by.",
			values: ["pattern", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		"is-exempt-recipient": {
			kind: "boolean",
			brief:
				"Filter to show only policies where messages to the recipient bypass all detections.",
			optional: true,
		},
		"is-trusted-sender": {
			kind: "boolean",
			brief:
				"Filter to show only policies where messages from the sender bypass all detections and link following.",
			optional: true,
		},
		"is-acceptable-sender": {
			kind: "boolean",
			brief:
				"Filter to show only policies where messages from the sender are exempted from Spam, Spoof, and Bulk dispositions (not Malicious or Suspicious).",
			optional: true,
		},
		"verify-sender": {
			kind: "boolean",
			brief:
				"Filter to show only policies that enforce DMARC, SPF, or DKIM authentication.",
			optional: true,
		},
		"pattern-type": {
			kind: "enum",
			brief: "Filter by pattern type.",
			values: ["EMAIL", "DOMAIN", "IP", "UNKNOWN"],
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief: "Filter by exact pattern value.",
			optional: true,
			parse: String,
		},
		expired: {
			kind: "boolean",
			brief:
				"Filter to return only expired policies (`true`) or only policies that still apply (`false`). Omit to return both.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security allow-policies list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"is-exempt-recipient",
						"is-trusted-sender",
						"is-acceptable-sender",
						"verify-sender",
						"pattern-type",
						"expired",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					order: argv["order"],
					direction: argv["direction"],
					is_exempt_recipient: argv["is-exempt-recipient"],
					is_trusted_sender: argv["is-trusted-sender"],
					is_acceptable_sender: argv["is-acceptable-sender"],
					verify_sender: argv["verify-sender"],
					pattern_type: argv["pattern-type"],
					pattern: argv["pattern"],
					expired: argv["expired"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security allow-policies list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/allow_policies`,
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
});

export default command;
