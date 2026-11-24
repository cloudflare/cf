import operation from "../../../_operations/cloudforce-one/threat-intel/events/update.js";
/**
 * update command
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
	command: "update <event-id>",
	describe: "Update an event",
	usage:
		"$0 cloudforce-one threat-intel events update <event-id>\n\nUpdates the given fields of an event and leaves the other fields unchanged. `datasetId` is required.",
	flags: {
		attacker: {
			kind: "parsed",
			brief: "The attacker field",
			optional: true,
			parse: String,
		},
		"attacker-country": {
			kind: "parsed",
			brief: "The attackerCountry field",
			optional: true,
			parse: String,
		},
		category: {
			kind: "parsed",
			brief: "The category field",
			optional: true,
			parse: String,
		},
		"created-at": {
			kind: "parsed",
			brief: "The createdAt field",
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "Dataset ID containing the event to update.",
			optional: true,
			parse: String,
		},
		date: {
			kind: "parsed",
			brief: "The date field",
			optional: true,
			parse: String,
		},
		event: {
			kind: "parsed",
			brief: "The event field",
			optional: true,
			parse: String,
		},
		indicator: {
			kind: "parsed",
			brief: "The indicator field",
			optional: true,
			parse: String,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "The indicatorType field",
			optional: true,
			parse: String,
		},
		insight: {
			kind: "parsed",
			brief: "The insight field",
			optional: true,
			parse: String,
		},
		"raw-data": {
			kind: "parsed",
			brief:
				'The raw.data field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"raw-source": {
			kind: "parsed",
			brief: "The raw.source field",
			optional: true,
			parse: String,
		},
		"raw-tlp": {
			kind: "parsed",
			brief: "The raw.tlp field",
			optional: true,
			parse: String,
		},
		"target-country": {
			kind: "parsed",
			brief: "The targetCountry field",
			optional: true,
			parse: String,
		},
		"target-industry": {
			kind: "parsed",
			brief: "The targetIndustry field",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
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
	operands: [{ placeholder: "event-id", brief: "Event UUID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
		),
});

export default command;
