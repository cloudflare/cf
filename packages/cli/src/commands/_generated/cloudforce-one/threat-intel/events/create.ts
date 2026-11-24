import operation from "../../../_operations/cloudforce-one/threat-intel/events/create.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create an event",
	usage:
		"$0 cloudforce-one threat-intel events create\n\nCreates an event in the dataset given by `datasetId`. Omitting `datasetId` is deprecated: the event is created in the default Cloudforce One Threat Events dataset, and a future release will reject the request. To create a dataset, use `threat-intel datasets create`.",
	flags: {
		"account-id-body": {
			kind: "parsed",
			brief: "The accountId field",
			optional: true,
			parse: Number,
		},
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
		"dataset-id": {
			kind: "parsed",
			brief: "The datasetId field",
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
		indicators: {
			kind: "parsed",
			brief:
				'Array of indicators for this event. Supports multiple indicators per event for complex scenarios. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"indicatorType": string, "value": string}].',
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
		"source-resource-id": {
			kind: "parsed",
			brief: "The source.resourceId field",
			optional: true,
			parse: String,
		},
		"source-resource-type": {
			kind: "parsed",
			brief: "The source.resourceType field",
			optional: true,
			choices: ["article"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-resource-type", "text"),
		},
		"source-system": {
			kind: "parsed",
			brief: "The source.system field",
			optional: true,
			choices: ["threat-signals"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-system", "text"),
		},
		"source-title": {
			kind: "parsed",
			brief:
				"Threat Signals article title; null for historical provenance without a stored title.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief: "The tags field",
			variadic: true,
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
	operands: [],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"source-resource-id",
				"source-resource-type",
				"source-system",
				"source-title",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"source-resource-id",
					"source-resource-type",
					"source-system",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
						argv["date"] = await promptForRequiredField(
							"date",
							"The date field"
						);
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
						? parseBody(argv.body, [
								{ path: ["raw", "data"], flag: "raw-data" },
							])
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
		),
});

export default command;
