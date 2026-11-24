import operation from "../../_operations/d1/time-travel/restore.js";
/**
 * restore command
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "restore <database-id>",
	describe: "Restore D1 Database to a bookmark or point in time",
	usage:
		"$0 d1 time-travel restore <database-id>\n\nRestore a D1 database to a previous point in time either via a bookmark or a timestamp.",
	flags: {
		bookmark: {
			kind: "parsed",
			brief:
				"A bookmark to restore the database to. Required if `timestamp` is not provided.",
			optional: true,
			parse: String,
		},
		timestamp: {
			kind: "parsed",
			brief:
				"An ISO 8601 timestamp to restore the database to. Required if `bookmark` is not provided.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
				command: "d1 time-travel restore",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					bookmark: argv["bookmark"],
					timestamp: argv["timestamp"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 time-travel restore",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/time_travel/restore`,
						pathParams: { "database-id": String(argv["database-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This reverts the D1 database to a previous point in time. Data written after the bookmark will be lost.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						account_id: accountId,
						database_id: argv["database-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
});

export default command;
