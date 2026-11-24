import operation from "../_operations/abuse-reports/list-submitted.js";
/**
 * list-submitted command
 * @generated from apis/overlays/abuse-reports.ts
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
	command: "list-submitted",
	describe: "List submitted abuse reports",
	usage:
		"$0 abuse-reports list-submitted\n\nList abuse reports submitted by the account.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Page of submitted reports to return.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of submitted reports per page.",
			optional: true,
			parse: Number,
		},
		sort: {
			kind: "parsed",
			brief:
				"A property and direction to sort by (id, cdate, domain, type, status).",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief: "Filter by report code.",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief:
				"Filter by reported domain. This parameter can be specified multiple times.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"created-before": {
			kind: "parsed",
			brief: "Return reports submitted before this time.",
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief: "Return reports submitted after this time.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Filter by submitter-facing status. This parameter can be specified multiple times.",
			variadic: true,
			optional: true,
			choices: ["submitted", "accepted", "denied"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		type: {
			kind: "parsed",
			brief:
				"Filter by report type. This parameter can be specified multiple times.",
			variadic: true,
			optional: true,
			choices: [
				"PHISH",
				"GEN",
				"THREAT",
				"DMCA",
				"EMER",
				"TM",
				"REG_WHO",
				"NCSEI",
				"NETWORK",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
				command: "abuse-reports list-submitted",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					sort: argv["sort"],
					id: argv["id"],
					domain: argv["domain"],
					created_before: argv["created-before"],
					created_after: argv["created-after"],
					status: argv["status"],
					type: argv["type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports list-submitted",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/submitted`,
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
