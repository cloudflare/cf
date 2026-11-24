import operation from "../../_operations/workers/scripts/search.js";
/**
 * search command
 * @generated from apis/overlays/workers.ts
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
	command: "search",
	describe: "Search Worker Scripts",
	usage:
		"$0 workers scripts search\n\nSearch for Worker scripts in an account.",
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Worker name to search for. Both exact and partial matches are returned.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief:
				"Worker ID (also called tag) to search for. Only exact matches are returned.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Property to sort results by. Results are sorted in ascending order.",
			values: ["created_on", "modified_on", "name"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Current page.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Items per page.",
			optional: true,
			parse: Number,
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
				command: "workers scripts search",
				classification: {
					safeFlags: ["order-by", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name: argv["name"],
					id: argv["id"],
					order_by: argv["order-by"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers scripts search",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/scripts-search`,
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
