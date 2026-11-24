import operation from "../../../_operations/cloudforce-one/threat-signals/articles/aggregate-relevance.js";
/**
 * aggregate-relevance command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "aggregate-relevance",
	describe: "Count Threat Signals articles by relevance band",
	usage:
		"$0 cloudforce-one threat-signals articles aggregate-relevance\n\nBeta. Counts the account's Threat Signals articles in each relevance band, for each active Priority Intelligence Requirement and across all of them. Uses the same PIRs as article relevance: active PIRs, including those the matcher paused; drafts and deleted PIRs are excluded. Articles not scored against a PIR are not counted for it. The combined counts place each article once, in the band of its best score, so they are not the sum of the per-PIR counts. read counts only read or only unread articles. All counts are read together and are exact.",
	flags: {
		"published-after": {
			kind: "parsed",
			brief:
				"Include articles published at or after this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		"published-before": {
			kind: "parsed",
			brief:
				"Include articles published at or before this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		read: {
			kind: "boolean",
			brief:
				"Filter by read state. Accepts true, false, 1, or 0; omit to include read and unread articles.",
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
				command: "cloudforce-one threat-signals articles aggregate-relevance",
				classification: {
					safeFlags: ["read", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					published_after: argv["published-after"],
					published_before: argv["published-before"],
					read: argv["read"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-signals articles aggregate-relevance",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles/relevance/aggregate`,
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
