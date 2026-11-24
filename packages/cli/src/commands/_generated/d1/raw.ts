import operation from "../_operations/d1/raw.js";
/**
 * raw command
 * @generated from apis/overlays/d1.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "raw <database-id>",
	describe: "Raw D1 Database query",
	usage:
		"$0 d1 raw <database-id>\n\nExecute a SQL query against a D1 database and return result rows as arrays rather than objects. This is a performance-optimized version of the /query endpoint.",
	flags: {
		params: {
			kind: "parsed",
			brief: "The params field",
			variadic: true,
			optional: true,
			parse: String,
		},
		sql: {
			kind: "parsed",
			brief:
				"Your SQL query. Supports multiple statements, joined by semicolons, which will be executed as a batch.",
			optional: true,
			parse: String,
		},
		batch: {
			kind: "parsed",
			brief:
				'The batch field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"sql": string, "params"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "A single query object or a batch query object",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "database-id",
			brief: "D1 database identifier (UUID).",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("params", ["batch"]);
		rules.implies("params", ["sql"]);
		rules.conflicts("sql", ["batch"]);
		rules.conflicts("batch", ["params", "sql"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 raw",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 raw",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/raw`,
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Loading`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							database_id: argv["database-id"],
						})
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					params: argv["params"],
					sql: resolveFileToken(
						argv["sql"] as string | undefined,
						"sql",
						"text"
					),
					batch: parseObjectArray(argv["batch"], "batch"),
				});
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						database_id: argv["database-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
