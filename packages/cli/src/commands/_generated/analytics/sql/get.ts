import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/analytics.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 analytics sql get\n\nExecutes a SQL query against the analytics datasets available to the caller. SQL placeholders can be bound with query parameters named `param_<name>`, such as `param_status=404` for `$status`."
		)
		.option("query", {
			type: "string",
			description: "SQL query to execute.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Query = SdkQuery<"sql-api-query-get">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Query analytics datasets",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics sql get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					query: argv["query"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf analytics sql get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/analytics/sql`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.analytics.sql.get(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
