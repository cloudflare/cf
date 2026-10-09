import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * undelete command
 * @generated from apis/overlays/d1.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 d1 undelete <database-id>\n\nRestore a deleted D1 database. The database is restored with the name it had when it was deleted, unless `new_name` is provided. The restored database counts against the account's limits. Undeleting a database that is not deleted succeeds without changes, unless `new_name` differs from its current name which errors. Once a database is undeleted, Time Travel (point-in-time recovery) cannot restore it to a bookmark or timestamp at or before the undeletion. Only states after the undeletion can be restored."
		)
		.positional("database-id", {
			type: "string",
			description: "D1 database identifier (UUID).",
			demandOption: true,
		})
		.option("new-name", {
			type: "string",
			description:
				"Restore the database with this name instead of the name it had when it was deleted. Required if another database in the account already uses that name.",
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
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"d1-undelete-database">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "undelete <database-id>",
	describe: "Undelete D1 Database",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 undelete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 undelete",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/undelete`,
						pathParams: { "database-id": String(argv["database-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										new_name: resolveFileToken(
											argv["new-name"] as string | undefined,
											"new-name",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `After undeleting, Time Travel cannot restore the D1 database to a point in time at or before the undeletion.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.d1.undelete({
							...bodyData,
							account_id: accountId,
							database_id: argv["database-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					new_name: resolveFileToken(
						argv["new-name"] as string | undefined,
						"new-name",
						"text"
					),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.d1.undelete({
						...bodyData,
						account_id: accountId,
						database_id: argv["database-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
