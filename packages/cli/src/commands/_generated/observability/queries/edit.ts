import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/observability.ts
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
		.usage("$0 observability queries edit <queryId>\n\nUpdate saved query.")
		.positional("query-id", {
			type: "string",
			description: "QueryId",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("name", { type: "string", description: "Query name" })
		.option("parameters-datasets", {
			type: "string",
			array: true,
			description:
				"Set the Datasets to query. Leave it empty to query all the datasets.",
		})
		.option("parameters-filter-combination", {
			type: "string",
			description:
				"Set a Flag to describe how to combine the filters on the query.",
			choices: ["and", "or", "AND", "OR"],
		})
		.option("parameters-limit", {
			type: "number",
			description:
				"Set a limit on the number of results / records returned by the query",
		})
		.option("parameters-needle-is-regex", {
			type: "boolean",
			description: "The parameters.needle.isRegex field",
		})
		.option("parameters-needle-match-case", {
			type: "boolean",
			description: "The parameters.needle.matchCase field",
		})
		.option("parameters-order-by-order", {
			type: "string",
			description: "Set the order of the results",
			choices: ["asc", "desc"],
		})
		.option("parameters-order-by-value", {
			type: "string",
			description: "Configure which Calculation to order the results by.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Specify the new contents of the query.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"queries.patch">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <queryId>",
	describe: "Update query",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "observability queries edit",
				classification: {
					safeFlags: [
						"parameters-filter-combination",
						"parameters-needle-is-regex",
						"parameters-needle-match-case",
						"parameters-order-by-order",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf observability queries edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/queries/${argv["query-id"] == null ? "<query-id>" : encodeURIComponent(String(argv["query-id"]))}`,
						pathParams: { "query-id": String(argv["query-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										parameters: {
											datasets: argv["parameters-datasets"],
											filterCombination: resolveFileToken(
												argv["parameters-filter-combination"] as
													| string
													| undefined,
												"parameters-filter-combination",
												"text"
											),
											limit: argv["parameters-limit"],
											needle: {
												isRegex: argv["parameters-needle-is-regex"],
												matchCase: argv["parameters-needle-match-case"],
											},
											orderBy: {
												order: resolveFileToken(
													argv["parameters-order-by-order"] as
														| string
														| undefined,
													"parameters-order-by-order",
													"text"
												),
												value: resolveFileToken(
													argv["parameters-order-by-value"] as
														| string
														| undefined,
													"parameters-order-by-value",
													"text"
												),
											},
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.observability.queries.edit({
							...bodyData,
							account_id: accountId,
							queryId: argv["query-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"The description field"
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "Query name");
				}
				if (argv["parameters-order-by-value"] === undefined) {
					argv["parameters-order-by-value"] = await promptForRequiredField(
						"parameters-order-by-value",
						"Configure which Calculation to order the results by."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					parameters: {
						datasets: argv["parameters-datasets"],
						filterCombination: resolveFileToken(
							argv["parameters-filter-combination"] as string | undefined,
							"parameters-filter-combination",
							"text"
						),
						limit: argv["parameters-limit"],
						needle: {
							isRegex: argv["parameters-needle-is-regex"],
							matchCase: argv["parameters-needle-match-case"],
						},
						orderBy: {
							order: resolveFileToken(
								argv["parameters-order-by-order"] as string | undefined,
								"parameters-order-by-order",
								"text"
							),
							value: resolveFileToken(
								argv["parameters-order-by-value"] as string | undefined,
								"parameters-order-by-value",
								"text"
							),
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.observability.queries.edit({
						...bodyData,
						account_id: accountId,
						queryId: argv["query-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
