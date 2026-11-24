import operation from "../../_operations/o11y/telemetry/query.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./query.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "o11y telemetry query",
			classification: {
				safeFlags: [
					"chart",
					"chart-type",
					"compare",
					"distribution-scale",
					"preview",
					"ignore-series",
					"parameters-filter-combination",
					"parameters-needle-is-regex",
					"parameters-needle-match-case",
					"parameters-order-by-order",
					"view",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["query-id"] === undefined) {
					argv["query-id"] = await promptForRequiredField(
						"query-id",
						"Identifier for the query. When parameters are omitted, this ID is used to load a previously saved query's parameters. When providing parameters inline, pass any identifier (e.g. an ad-hoc ID)."
					);
				}
				if (argv["timeframe-from"] === undefined) {
					throw new Error(
						"--timeframe-from is required (or pass --body with this field set)."
					);
				}
				if (argv["timeframe-to"] === undefined) {
					throw new Error(
						"--timeframe-to is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf o11y telemetry query",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/telemetry/query`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									chart: argv["chart"],
									chartType: argv["chart-type"],
									compare: argv["compare"],
									distributionScale: argv["distribution-scale"],
									dry: argv["preview"],
									granularity: argv["granularity"],
									ignoreSeries: argv["ignore-series"],
									limit: argv["limit"],
									offset: resolveFileToken(
										argv["offset"] as string | undefined,
										"offset",
										"text"
									),
									offsetBy: argv["offset-by"],
									offsetDirection: resolveFileToken(
										argv["offset-direction"] as string | undefined,
										"offset-direction",
										"text"
									),
									parameters: {
										calculations: parseObjectArray(
											argv["parameters-calculations"],
											"parameters-calculations"
										),
										datasets: argv["parameters-datasets"],
										filterCombination: argv["parameters-filter-combination"],
										filters: parseObjectArray(
											argv["parameters-filters"],
											"parameters-filters"
										),
										groupBys: parseObjectArray(
											argv["parameters-group-bys"],
											"parameters-group-bys"
										),
										havings: parseObjectArray(
											argv["parameters-havings"],
											"parameters-havings"
										),
										limit: argv["parameters-limit"],
										needle: {
											isRegex: argv["parameters-needle-is-regex"],
											matchCase: argv["parameters-needle-match-case"],
										},
										orderBy: {
											order: argv["parameters-order-by-order"],
											value: resolveFileToken(
												argv["parameters-order-by-value"] as string | undefined,
												"parameters-order-by-value",
												"text"
											),
										},
									},
									queryId: resolveFileToken(
										argv["query-id"] as string | undefined,
										"query-id",
										"text"
									),
									timeframe: {
										from: argv["timeframe-from"],
										to: argv["timeframe-to"],
									},
									view: argv["view"],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				chart: argv["chart"],
				chartType: argv["chart-type"],
				compare: argv["compare"],
				distributionScale: argv["distribution-scale"],
				dry: argv["preview"],
				granularity: argv["granularity"],
				ignoreSeries: argv["ignore-series"],
				limit: argv["limit"],
				offset: resolveFileToken(
					argv["offset"] as string | undefined,
					"offset",
					"text"
				),
				offsetBy: argv["offset-by"],
				offsetDirection: resolveFileToken(
					argv["offset-direction"] as string | undefined,
					"offset-direction",
					"text"
				),
				parameters: {
					calculations: parseObjectArray(
						argv["parameters-calculations"],
						"parameters-calculations"
					),
					datasets: argv["parameters-datasets"],
					filterCombination: argv["parameters-filter-combination"],
					filters: parseObjectArray(
						argv["parameters-filters"],
						"parameters-filters"
					),
					groupBys: parseObjectArray(
						argv["parameters-group-bys"],
						"parameters-group-bys"
					),
					havings: parseObjectArray(
						argv["parameters-havings"],
						"parameters-havings"
					),
					limit: argv["parameters-limit"],
					needle: {
						isRegex: argv["parameters-needle-is-regex"],
						matchCase: argv["parameters-needle-match-case"],
					},
					orderBy: {
						order: argv["parameters-order-by-order"],
						value: resolveFileToken(
							argv["parameters-order-by-value"] as string | undefined,
							"parameters-order-by-value",
							"text"
						),
					},
				},
				queryId: resolveFileToken(
					argv["query-id"] as string | undefined,
					"query-id",
					"text"
				),
				timeframe: {
					from: argv["timeframe-from"],
					to: argv["timeframe-to"],
				},
				view: argv["view"],
			});
			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
