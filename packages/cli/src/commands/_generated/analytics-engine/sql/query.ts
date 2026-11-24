/**
 * query command
 * @generated from apis/overlays/analytics-engine.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "query",
	describe: "Execute an Analytics Engine SQL query via request body",
	usage:
		"$0 analytics-engine sql query\n\nExecutes a SQL query against Workers Analytics Engine data. Pass the SQL query in the request body as plain text. The response uses newline-delimited JSON (NDJSON) by default, or a single JSON object when the query includes a FORMAT JSON clause. Prefer this method for longer queries that may exceed URL length limits.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Plain-text request body (without JSON quotes)",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics-engine sql query",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.body === undefined && argv.file === undefined) {
					throw new Error(
						"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf analytics-engine sql query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/analytics_engine/sql`,
						pathParams: {},
						bodyKind: "octet-stream",
						body: argv.file !== undefined ? { file: argv.file } : argv.body,
					});
					return;
				}
				const parsedBody =
					argv.file !== undefined
						? undefined
						: resolveFileToken(argv.body, "body", "binary");
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/analytics_engine/sql`,
							{ body: fileContent, headers: { "Content-Type": "text/plain" } }
						)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/analytics_engine/sql`,
							{ body: bodyData, headers: { "Content-Type": "text/plain" } }
						)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
			}
		),
});

export default command;
