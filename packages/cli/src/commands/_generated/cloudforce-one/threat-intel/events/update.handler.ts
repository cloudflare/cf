import operation from "../../../_operations/cloudforce-one/threat-intel/events/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
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
			command: "cloudforce-one threat-intel events update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["dataset-id"] === undefined) {
					argv["dataset-id"] = await promptForRequiredField(
						"dataset-id",
						"Dataset ID containing the event to update."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel events update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}`,
					pathParams: { "event-id": String(argv["event-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
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
										createdAt: resolveFileToken(
											argv["created-at"] as string | undefined,
											"created-at",
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
										insight: resolveFileToken(
											argv["insight"] as string | undefined,
											"insight",
											"text"
										),
										raw: {
											data: parseJsonMap(argv["raw-data"], "raw-data"),
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
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						event_id: argv["event-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
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
					createdAt: resolveFileToken(
						argv["created-at"] as string | undefined,
						"created-at",
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
					insight: resolveFileToken(
						argv["insight"] as string | undefined,
						"insight",
						"text"
					),
					raw: {
						data: parseJsonMap(argv["raw-data"], "raw-data"),
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
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					event_id: argv["event-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
