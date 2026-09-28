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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * export command
 * @generated from apis/overlays/d1.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 d1 export <database-id>\n\nExport the SQL contents of a D1 database and return a URL where they can be downloaded. Note: this process may take some time for larger DBs, during which your D1 will be unavailable to serve queries. To avoid blocking your DB unnecessarily, an in-progress export must be continually polled or will automatically cancel."
		)
		.positional("database-id", {
			type: "string",
			description: "D1 database identifier (UUID).",
			demandOption: true,
		})
		.option("current-bookmark", {
			type: "string",
			description:
				"To poll an in-progress export, provide the current bookmark (returned by your first polling response)",
		})
		.option("dump-options-no-data", {
			type: "boolean",
			description: "Export only the table definitions, not their contents",
		})
		.option("dump-options-no-schema", {
			type: "boolean",
			description: "Export only each table's contents, not its definition",
		})
		.option("dump-options-tables", {
			type: "string",
			array: true,
			description:
				"Filter the export to just one or more tables. Passing an empty array is the same as not passing anything and means: export all tables.",
		})
		.option("output-format", {
			type: "string",
			description:
				"Specifies that you will poll this endpoint until the export completes",
			choices: ["polling"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"d1-export-database">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "export <database-id>",
	describe: "Export D1 Database as SQL",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 export",
				classification: {
					safeFlags: [
						"dump-options-no-data",
						"dump-options-no-schema",
						"output-format",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 export",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/export`,
						pathParams: { "database-id": String(argv["database-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										current_bookmark: resolveFileToken(
											argv["current-bookmark"] as string | undefined,
											"current-bookmark",
											"text"
										),
										dump_options: {
											no_data: argv["dump-options-no-data"],
											no_schema: argv["dump-options-no-schema"],
											tables: argv["dump-options-tables"],
										},
										output_format: resolveFileToken(
											argv["output-format"] as string | undefined,
											"output-format",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.d1.export({
							...bodyData,
							account_id: accountId,
							database_id: argv["database-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				if (argv["output-format"] === undefined) {
					argv["output-format"] = await promptForRequiredEnumField(
						"output-format",
						"Specifies that you will poll this endpoint until the export completes",
						["polling"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					current_bookmark: resolveFileToken(
						argv["current-bookmark"] as string | undefined,
						"current-bookmark",
						"text"
					),
					dump_options: {
						no_data: argv["dump-options-no-data"],
						no_schema: argv["dump-options-no-schema"],
						tables: argv["dump-options-tables"],
					},
					output_format: resolveFileToken(
						argv["output-format"] as string | undefined,
						"output-format",
						"text"
					),
				});
				const result = await withProgress(`Loading`, async () =>
					client.d1.export({
						...bodyData,
						account_id: accountId,
						database_id: argv["database-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
