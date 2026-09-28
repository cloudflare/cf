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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * restore command
 * @generated from apis/overlays/d1.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 d1 time-travel restore <database-id>\n\nRestore a D1 database to a previous point in time either via a bookmark or a timestamp."
		)
		.positional("database-id", {
			type: "string",
			description: "D1 database identifier (UUID).",
			demandOption: true,
		})
		.option("bookmark", {
			type: "string",
			description:
				"A bookmark to restore the database to. Required if `timestamp` is not provided.",
		})
		.option("timestamp", {
			type: "string",
			description:
				"An ISO 8601 timestamp to restore the database to. Required if `bookmark` is not provided.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"d1-time-travel-restore">;
type Query = SdkQuery<"d1-time-travel-restore">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "restore <database-id>",
	describe: "Restore D1 Database to a bookmark or point in time",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 time-travel restore",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.d1.timeTravel.restore({
						account_id: accountId,
						database_id: argv["database-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
