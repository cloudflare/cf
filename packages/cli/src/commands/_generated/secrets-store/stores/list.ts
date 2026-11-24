import operation from "../../_operations/secrets-store/stores/list.js";
/**
 * list command
 * @generated from apis/overlays/secrets-store.ts
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
	describe: "List account stores",
	usage:
		"$0 secrets-store stores list\n\nLists account stores from an eventually consistent projection. Returns retryable HTTP 503 until initial backfill completes; empty accounts are ready immediately.",
	flags: {
		direction: {
			kind: "enum",
			brief: "Direction to sort objects.",
			values: ["asc", "desc"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of objects to return per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Order stores by values in the given field.",
			values: ["name", "created", "modified"],
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
				command: "secrets-store stores list",
				classification: {
					safeFlags: ["direction", "order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf secrets-store stores list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secrets_store/stores`,
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
