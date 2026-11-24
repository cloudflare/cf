import operation from "../../../../_operations/zero-trust/access/logs/jit-requests/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "List Access JIT request logs",
	usage:
		"$0 zero-trust access logs jit-requests list\n\nLists account-wide Access JIT request logs reconstructed from request lifecycle events.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief:
				"JIT request status. `SPENT` is deprecated and interpreted as `APPROVED`.",
			values: ["PENDING", "APPROVED", "DENIED", "CANCELED", "SPENT"],
			optional: true,
		},
		search: {
			kind: "parsed",
			brief:
				"Case-insensitive search over request ID, requester email, application audience, and application hostname.",
			optional: true,
			parse: String,
		},
		since: {
			kind: "parsed",
			brief:
				"The earliest request timestamp to query. Defaults to 366 days before the current time.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief:
				"The latest request timestamp to query. Defaults to the current time.",
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
				command: "zero-trust access logs jit-requests list",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					status: argv["status"],
					search: argv["search"],
					since: argv["since"],
					until: argv["until"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access logs jit-requests list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/logs/jit_requests`,
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
