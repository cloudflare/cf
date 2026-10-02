import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * query command
 * @generated from apis/overlays/analytics_engine.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 analytics_engine sql query\n\nExecutes a SQL query against Workers Analytics Engine data. Pass the SQL query in the request body as plain text. The response uses newline-delimited JSON (NDJSON) by default, or a single JSON object when the query includes a FORMAT JSON clause. Prefer this method for longer queries that may exceed URL length limits."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"analytics-engine-sql-query-post">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "query",
	describe: "Execute an Analytics Engine SQL query via request body",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics_engine sql query",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf analytics_engine sql query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/analytics_engine/sql`,
						pathParams: {},
						bodyKind: "octet-stream",
						body: argv.body,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file) {
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

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
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

				const result = await withProgress(`Loading`, async () =>
					client.analyticsEngine.sql.query({
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
