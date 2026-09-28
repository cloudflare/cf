import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * query command
 * @generated from apis/overlays/d1.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 d1 query <database-id>\n\nExecute a SQL query against a D1 database and return results as objects."
		)
		.positional("database-id", {
			type: "string",
			description: "D1 database identifier (UUID).",
			demandOption: true,
		})
		.option("params", {
			type: "string",
			array: true,
			description: "The params field",
		})
		.option("sql", {
			type: "string",
			description:
				"Your SQL query. Supports multiple statements, joined by semicolons, which will be executed as a batch.",
		})
		.option("batch", {
			type: "string",
			description:
				"The batch field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "A single query object or a batch query object",
		})
		.conflicts("params", ["batch"])
		.conflicts("sql", ["batch"])
		.conflicts("batch", ["params", "sql"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"d1-query-database">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "query <database-id>",
	describe: "Query D1 Database",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 query",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/query`,
						pathParams: { "database-id": String(argv["database-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										params: argv["params"],
										sql: resolveFileToken(
											argv["sql"] as string | undefined,
											"sql",
											"text"
										),
										batch: parseObjectArray(argv["batch"], "batch"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.d1.query({
							body: bodyData,
							account_id: accountId,
							database_id: argv["database-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					params: argv["params"],
					sql: resolveFileToken(
						argv["sql"] as string | undefined,
						"sql",
						"text"
					),
					batch: parseObjectArray(argv["batch"], "batch"),
				});
				const result = await withProgress(`Loading`, async () =>
					client.d1.query({
						body: bodyData,
						account_id: accountId,
						database_id: argv["database-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
