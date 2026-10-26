import operation from "../../_operations/cloudforce-one/threat-intel/search.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * search command
 * @generated from apis/overlays/cloudforce-one.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-intel search\n\nSearches the articles, actors, tags, events, and indicators you can read and returns one list of typed results, most relevant first. Use `entity_types` to limit the types searched."
		)
		.option("entity-types", {
			type: "string",
			array: true,
			description:
				"Entity types to search. Omit to search articles, actors, tags, events, and indicators.",
		})
		.option("include-analytics-datasets", {
			type: "boolean",
			description:
				"Whether to include Event and Indicator matches from analytics datasets. Defaults to false because these datasets can take longer to search. When omitted or false, those matches are intentionally excluded and source completeness covers only the backends that were queried.",
			default: false,
		})
		.option("limit", {
			type: "number",
			description: "Maximum number of results to return. Defaults to 20.",
			default: 20,
		})
		.option("query", {
			type: "string",
			description: "Search text, from 1 to 1000 characters after trimming.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "search",
	describe: "Search threat intelligence",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel search",
				classification: {
					safeFlags: ["include-analytics-datasets", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel search",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/search`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										entity_types: argv["entity-types"],
										include_analytics_datasets:
											argv["include-analytics-datasets"],
										limit: argv["limit"],
										query: resolveFileToken(
											argv["query"] as string | undefined,
											"query",
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
					const result = await withProgress(`Loading`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				if (argv["query"] === undefined) {
					argv["query"] = await promptForRequiredField(
						"query",
						"Search text, from 1 to 1000 characters after trimming."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					entity_types: argv["entity-types"],
					include_analytics_datasets: argv["include-analytics-datasets"],
					limit: argv["limit"],
					query: resolveFileToken(
						argv["query"] as string | undefined,
						"query",
						"text"
					),
				});
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
