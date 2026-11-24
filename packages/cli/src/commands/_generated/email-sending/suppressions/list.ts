import operation from "../../_operations/email-sending/suppressions/list.js";
/**
 * list command
 * @generated from apis/overlays/email-sending.ts
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
	describe: "List account Email Sending suppressions",
	usage:
		"$0 email-sending suppressions list\n\nLists every active Email Sending suppression owned by the account: sending-domain suppressions and account-wide suppressions. Each scope is listed newest first. The order between sending-domain and account-wide suppressions is not fixed; use `scope_type` to list one scope.",
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of suppressions to return per page.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque pagination cursor returned as `result_info.next_cursor`. It carries the filters that produced it.",
			optional: true,
			parse: String,
		},
		email: {
			kind: "parsed",
			brief: "Exact email-address filter.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"A complete address is an exact match; a value ending in `@` matches that username across every domain. Prefix searches may return short intermediate pages while the bounded account scan advances.",
			optional: true,
			parse: String,
		},
		reason: {
			kind: "enum",
			brief: "Filter to suppressions with this reason.",
			values: ["manual", "complaint", "hard_bounce", "soft_bounce", "policy"],
			optional: true,
		},
		"scope-type": {
			kind: "enum",
			brief:
				"Filter by scope: `account` returns only account-wide suppressions, `sending_domain` only sending-domain suppressions. Omit to list both; the order between the two scopes is not fixed.",
			values: ["account", "sending_domain"],
			optional: true,
		},
		"scope-value": {
			kind: "parsed",
			brief:
				"Exact sending-domain filter. Requires `scope_type=sending_domain`.",
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
				command: "email-sending suppressions list",
				classification: {
					safeFlags: ["reason", "scope-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					email: argv["email"],
					search: argv["search"],
					reason: argv["reason"],
					scope_type: argv["scope-type"],
					scope_value: argv["scope-value"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-sending suppressions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/suppressions`,
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
