import operation from "../../_operations/email-security/trusted-domains/list.js";
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
	describe: "List trusted email domains",
	usage:
		"$0 email-security trusted-domains list\n\nReturns a paginated list of trusted domain patterns. Trusted domains prevent false positives for recently registered domains and lookalike domain detections. Patterns can use regular expressions for flexible matching.",
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
		"is-recent": {
			kind: "boolean",
			brief:
				"Filter to show only recently registered domains that are trusted to prevent triggering Suspicious or Malicious dispositions.",
			optional: true,
		},
		"is-similarity": {
			kind: "boolean",
			brief:
				"Filter to show only proximity domains (partner or approved domains with similar spelling to connected domains) that prevent Spoof dispositions.",
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief: "Pattern",
			optional: true,
			parse: String,
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
				command: "email-security trusted-domains list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"is-recent",
						"is-similarity",
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
					is_recent: argv["is-recent"],
					is_similarity: argv["is-similarity"],
					pattern: argv["pattern"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security trusted-domains list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/trusted_domains`,
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
