import operation from "../../../_operations/cloudforce-one/threat-intel/events/bulk-update.js";
/**
 * bulk-update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "bulk-update",
	describe: "Update events in bulk",
	usage:
		"$0 cloudforce-one threat-intel events bulk-update\n\nApplies the same field values to up to 100 events in one dataset. The `date` field can't be changed in bulk.",
	flags: {
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset ID containing the events to update. Required to prevent cross-account modifications.",
			optional: true,
			parse: String,
		},
		"event-ids": {
			kind: "parsed",
			brief: "List of event UUIDs to update (1-100)",
			variadic: true,
			optional: true,
			parse: String,
		},
		"updates-attacker": {
			kind: "parsed",
			brief: "The updates.attacker field",
			optional: true,
			parse: String,
		},
		"updates-attacker-country": {
			kind: "parsed",
			brief: "The updates.attackerCountry field",
			optional: true,
			parse: String,
		},
		"updates-category": {
			kind: "parsed",
			brief: "The updates.category field",
			optional: true,
			parse: String,
		},
		"updates-created-at": {
			kind: "parsed",
			brief: "The updates.createdAt field",
			optional: true,
			parse: String,
		},
		"updates-event": {
			kind: "parsed",
			brief: "The updates.event field",
			optional: true,
			parse: String,
		},
		"updates-indicator": {
			kind: "parsed",
			brief: "The updates.indicator field",
			optional: true,
			parse: String,
		},
		"updates-indicator-type": {
			kind: "parsed",
			brief: "The updates.indicatorType field",
			optional: true,
			parse: String,
		},
		"updates-insight": {
			kind: "parsed",
			brief: "The updates.insight field",
			optional: true,
			parse: String,
		},
		"updates-raw-data": {
			kind: "parsed",
			brief:
				'The updates.raw.data field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"updates-raw-source": {
			kind: "parsed",
			brief: "The updates.raw.source field",
			optional: true,
			parse: String,
		},
		"updates-raw-tlp": {
			kind: "parsed",
			brief: "The updates.raw.tlp field",
			optional: true,
			parse: String,
		},
		"updates-target-country": {
			kind: "parsed",
			brief: "The updates.targetCountry field",
			optional: true,
			parse: String,
		},
		"updates-target-industry": {
			kind: "parsed",
			brief: "The updates.targetIndustry field",
			optional: true,
			parse: String,
		},
		"updates-tlp": {
			kind: "parsed",
			brief: "The updates.tlp field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events bulk-update",
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
							"Dataset ID containing the events to update. Required to prevent cross-account modifications."
						);
					}
					if (argv["event-ids"] === undefined) {
						throw new Error(
							"--event-ids is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events bulk-update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/update/bulk`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											datasetId: resolveFileToken(
												argv["dataset-id"] as string | undefined,
												"dataset-id",
												"text"
											),
											eventIds: argv["event-ids"],
											updates: {
												attacker: resolveFileToken(
													argv["updates-attacker"] as string | undefined,
													"updates-attacker",
													"text"
												),
												attackerCountry: resolveFileToken(
													argv["updates-attacker-country"] as
														| string
														| undefined,
													"updates-attacker-country",
													"text"
												),
												category: resolveFileToken(
													argv["updates-category"] as string | undefined,
													"updates-category",
													"text"
												),
												createdAt: resolveFileToken(
													argv["updates-created-at"] as string | undefined,
													"updates-created-at",
													"text"
												),
												event: resolveFileToken(
													argv["updates-event"] as string | undefined,
													"updates-event",
													"text"
												),
												indicator: resolveFileToken(
													argv["updates-indicator"] as string | undefined,
													"updates-indicator",
													"text"
												),
												indicatorType: resolveFileToken(
													argv["updates-indicator-type"] as string | undefined,
													"updates-indicator-type",
													"text"
												),
												insight: resolveFileToken(
													argv["updates-insight"] as string | undefined,
													"updates-insight",
													"text"
												),
												raw: {
													data: parseJsonMap(
														argv["updates-raw-data"],
														"updates-raw-data"
													),
													source: resolveFileToken(
														argv["updates-raw-source"] as string | undefined,
														"updates-raw-source",
														"text"
													),
													tlp: resolveFileToken(
														argv["updates-raw-tlp"] as string | undefined,
														"updates-raw-tlp",
														"text"
													),
												},
												targetCountry: resolveFileToken(
													argv["updates-target-country"] as string | undefined,
													"updates-target-country",
													"text"
												),
												targetIndustry: resolveFileToken(
													argv["updates-target-industry"] as string | undefined,
													"updates-target-industry",
													"text"
												),
												tlp: resolveFileToken(
													argv["updates-tlp"] as string | undefined,
													"updates-tlp",
													"text"
												),
											},
										},
										[["updates", "raw", "data"]]
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						datasetId: resolveFileToken(
							argv["dataset-id"] as string | undefined,
							"dataset-id",
							"text"
						),
						eventIds: argv["event-ids"],
						updates: {
							attacker: resolveFileToken(
								argv["updates-attacker"] as string | undefined,
								"updates-attacker",
								"text"
							),
							attackerCountry: resolveFileToken(
								argv["updates-attacker-country"] as string | undefined,
								"updates-attacker-country",
								"text"
							),
							category: resolveFileToken(
								argv["updates-category"] as string | undefined,
								"updates-category",
								"text"
							),
							createdAt: resolveFileToken(
								argv["updates-created-at"] as string | undefined,
								"updates-created-at",
								"text"
							),
							event: resolveFileToken(
								argv["updates-event"] as string | undefined,
								"updates-event",
								"text"
							),
							indicator: resolveFileToken(
								argv["updates-indicator"] as string | undefined,
								"updates-indicator",
								"text"
							),
							indicatorType: resolveFileToken(
								argv["updates-indicator-type"] as string | undefined,
								"updates-indicator-type",
								"text"
							),
							insight: resolveFileToken(
								argv["updates-insight"] as string | undefined,
								"updates-insight",
								"text"
							),
							raw: {
								data: parseJsonMap(
									argv["updates-raw-data"],
									"updates-raw-data"
								),
								source: resolveFileToken(
									argv["updates-raw-source"] as string | undefined,
									"updates-raw-source",
									"text"
								),
								tlp: resolveFileToken(
									argv["updates-raw-tlp"] as string | undefined,
									"updates-raw-tlp",
									"text"
								),
							},
							targetCountry: resolveFileToken(
								argv["updates-target-country"] as string | undefined,
								"updates-target-country",
								"text"
							),
							targetIndustry: resolveFileToken(
								argv["updates-target-industry"] as string | undefined,
								"updates-target-industry",
								"text"
							),
							tlp: resolveFileToken(
								argv["updates-tlp"] as string | undefined,
								"updates-tlp",
								"text"
							),
						},
					},
					[["updates", "raw", "data"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
