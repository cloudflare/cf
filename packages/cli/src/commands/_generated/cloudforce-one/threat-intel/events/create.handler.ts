import operation from "../../../_operations/cloudforce-one/threat-intel/events/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
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
			command: "cloudforce-one threat-intel events create",
			classification: {
				safeFlags: ["source-resource-type", "source-system", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["category"] === undefined) {
					argv["category"] = await promptForRequiredField(
						"category",
						"The category field"
					);
				}
				if (argv["date"] === undefined) {
					argv["date"] = await promptForRequiredField("date", "The date field");
				}
				if (argv["event"] === undefined) {
					argv["event"] = await promptForRequiredField(
						"event",
						"The event field"
					);
				}
				if (argv["raw-data"] === undefined) {
					throw new Error(
						"--raw-data is required (or pass --body with this field set)."
					);
				}
				if (argv["tlp"] === undefined) {
					argv["tlp"] = await promptForRequiredField("tlp", "The tlp field");
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel events create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/create`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body, [
									{ path: ["raw", "data"], flag: "raw-data" },
								])
							: compactBody(
									{
										accountId: argv["account-id-body"],
										attacker: resolveFileToken(
											argv["attacker"] as string | undefined,
											"attacker",
											"text"
										),
										attackerCountry: resolveFileToken(
											argv["attacker-country"] as string | undefined,
											"attacker-country",
											"text"
										),
										category: resolveFileToken(
											argv["category"] as string | undefined,
											"category",
											"text"
										),
										datasetId: resolveFileToken(
											argv["dataset-id"] as string | undefined,
											"dataset-id",
											"text"
										),
										date: resolveFileToken(
											argv["date"] as string | undefined,
											"date",
											"text"
										),
										event: resolveFileToken(
											argv["event"] as string | undefined,
											"event",
											"text"
										),
										indicator: resolveFileToken(
											argv["indicator"] as string | undefined,
											"indicator",
											"text"
										),
										indicatorType: resolveFileToken(
											argv["indicator-type"] as string | undefined,
											"indicator-type",
											"text"
										),
										indicators: parseObjectArray(
											argv["indicators"],
											"indicators"
										),
										insight: resolveFileToken(
											argv["insight"] as string | undefined,
											"insight",
											"text"
										),
										raw: {
											data: parseJsonMap(argv["raw-data"], "raw-data", true),
											source: resolveFileToken(
												argv["raw-source"] as string | undefined,
												"raw-source",
												"text"
											),
											tlp: resolveFileToken(
												argv["raw-tlp"] as string | undefined,
												"raw-tlp",
												"text"
											),
										},
										source: {
											resourceId: resolveFileToken(
												argv["source-resource-id"] as string | undefined,
												"source-resource-id",
												"text"
											),
											resourceType: argv["source-resource-type"],
											system: argv["source-system"],
											title: resolveFileToken(
												argv["source-title"] as string | undefined,
												"source-title",
												"text"
											),
										},
										tags: argv["tags"],
										targetCountry: resolveFileToken(
											argv["target-country"] as string | undefined,
											"target-country",
											"text"
										),
										targetIndustry: resolveFileToken(
											argv["target-industry"] as string | undefined,
											"target-industry",
											"text"
										),
										tlp: resolveFileToken(
											argv["tlp"] as string | undefined,
											"tlp",
											"text"
										),
									},
									[["raw", "data"]]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? parseBody(argv.body, [{ path: ["raw", "data"], flag: "raw-data" }])
					: undefined;
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
			const bodyData = compactBody(
				{
					accountId: argv["account-id-body"],
					attacker: resolveFileToken(
						argv["attacker"] as string | undefined,
						"attacker",
						"text"
					),
					attackerCountry: resolveFileToken(
						argv["attacker-country"] as string | undefined,
						"attacker-country",
						"text"
					),
					category: resolveFileToken(
						argv["category"] as string | undefined,
						"category",
						"text"
					),
					datasetId: resolveFileToken(
						argv["dataset-id"] as string | undefined,
						"dataset-id",
						"text"
					),
					date: resolveFileToken(
						argv["date"] as string | undefined,
						"date",
						"text"
					),
					event: resolveFileToken(
						argv["event"] as string | undefined,
						"event",
						"text"
					),
					indicator: resolveFileToken(
						argv["indicator"] as string | undefined,
						"indicator",
						"text"
					),
					indicatorType: resolveFileToken(
						argv["indicator-type"] as string | undefined,
						"indicator-type",
						"text"
					),
					indicators: parseObjectArray(argv["indicators"], "indicators"),
					insight: resolveFileToken(
						argv["insight"] as string | undefined,
						"insight",
						"text"
					),
					raw: {
						data: parseJsonMap(argv["raw-data"], "raw-data", true),
						source: resolveFileToken(
							argv["raw-source"] as string | undefined,
							"raw-source",
							"text"
						),
						tlp: resolveFileToken(
							argv["raw-tlp"] as string | undefined,
							"raw-tlp",
							"text"
						),
					},
					source: {
						resourceId: resolveFileToken(
							argv["source-resource-id"] as string | undefined,
							"source-resource-id",
							"text"
						),
						resourceType: argv["source-resource-type"],
						system: argv["source-system"],
						title: resolveFileToken(
							argv["source-title"] as string | undefined,
							"source-title",
							"text"
						),
					},
					tags: argv["tags"],
					targetCountry: resolveFileToken(
						argv["target-country"] as string | undefined,
						"target-country",
						"text"
					),
					targetIndustry: resolveFileToken(
						argv["target-industry"] as string | undefined,
						"target-industry",
						"text"
					),
					tlp: resolveFileToken(
						argv["tlp"] as string | undefined,
						"tlp",
						"text"
					),
				},
				[["raw", "data"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
