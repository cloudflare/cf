import operation from "../../_operations/d1/time-travel/get-bookmark.js";
/**
 * get-bookmark command
 * @generated from apis/overlays/d1.ts
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
	command: "get-bookmark <database-id>",
	describe: "Get D1 database bookmark",
	usage:
		"$0 d1 time-travel get-bookmark <database-id>\n\nRetrieve the current bookmark, or the nearest bookmark at or before a provided timestamp. Bookmarks can be used with the restore endpoint to revert the database to a previous point in time.",
	flags: {
		timestamp: {
			kind: "parsed",
			brief:
				"An optional ISO 8601 timestamp. If provided, returns the nearest available bookmark at or before this timestamp. If omitted, returns the current bookmark.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "database-id",
			brief: "D1 database identifier (UUID).",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 time-travel get-bookmark",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					timestamp: argv["timestamp"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 time-travel get-bookmark",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/time_travel/bookmark`,
						pathParams: { "database-id": String(argv["database-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						database_id: argv["database-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
