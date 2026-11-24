import operation from "../../_operations/o11y/queries/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "o11y queries create",
			classification: {
				safeFlags: [
					"parameters-filter-combination",
					"parameters-needle-is-regex",
					"parameters-needle-match-case",
					"parameters-order-by-order",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"The description field"
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "Query name");
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf o11y queries create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/queries`,
					pathParams: {},
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
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
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
