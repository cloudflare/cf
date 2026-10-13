import operation from "../../_operations/o11y/telemetry/live-tail.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * live-tail command
 * @generated from apis/overlays/o11y.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 o11y telemetry live-tail\n\nPrepare websocket server for live tail."
		)
		.option("filter-combination", {
			type: "string",
			description:
				"Set a flag to describe how to combine the filters on the query.",
			choices: ["and", "or", "AND", "OR"],
			default: "and",
		})
		.coerce("filter-combination", (value) =>
			resolveFileToken(value, "filter-combination", "text")
		)
		.option("filters", {
			type: "string",
			description:
				"Apply filters to the query. Supports nested groups via kind: 'group'. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("script-id", { type: "string", description: "The scriptId field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Create websocket server for live tail.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "live-tail",
	describe: "Prepare live tail",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y telemetry live-tail",
				classification: {
					safeFlags: ["filter-combination", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y telemetry live-tail",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/telemetry/live-tail`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										filterCombination: argv["filter-combination"],
										filters: parseObjectArray(argv["filters"], "filters"),
										scriptId: resolveFileToken(
											argv["script-id"] as string | undefined,
											"script-id",
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
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					filterCombination: argv["filter-combination"],
					filters: parseObjectArray(argv["filters"], "filters"),
					scriptId: resolveFileToken(
						argv["script-id"] as string | undefined,
						"script-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
