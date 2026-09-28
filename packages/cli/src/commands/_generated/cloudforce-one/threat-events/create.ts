import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-events create <account-id-path>\n\nTo create a dataset, see the [`Create Dataset`](https://developers.cloudflare.com/api/resources/cloudforce_one/subresources/threat_events/subresources/datasets/methods/create/) endpoint. When `datasetId` parameter is unspecified, it will be created in a default dataset named `Cloudforce One Threat Events`."
		)
		.positional("account-id-path", {
			type: "string",
			description: "Account ID.",
			demandOption: true,
		})
		.option("account-id-body", {
			type: "number",
			description: "The accountId field",
		})
		.option("attacker", { type: "string", description: "The attacker field" })
		.option("attacker-country", {
			type: "string",
			description: "The attackerCountry field",
		})
		.option("category", { type: "string", description: "The category field" })
		.option("dataset-id", {
			type: "string",
			description: "The datasetId field",
		})
		.option("date", { type: "string", description: "The date field" })
		.option("event", { type: "string", description: "The event field" })
		.option("indicator", { type: "string", description: "The indicator field" })
		.option("indicator-type", {
			type: "string",
			description: "The indicatorType field",
		})
		.option("indicators", {
			type: "string",
			description:
				"Array of indicators for this event. Supports multiple indicators per event for complex scenarios. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("insight", { type: "string", description: "The insight field" })
		.option("raw-source", {
			type: "string",
			description: "The raw.source field",
		})
		.option("raw-tlp", { type: "string", description: "The raw.tlp field" })
		.option("source-resource-id", {
			type: "string",
			description: "The source.resourceId field",
		})
		.option("source-resource-type", {
			type: "string",
			description: "The source.resourceType field",
			choices: ["article"],
		})
		.option("source-system", {
			type: "string",
			description: "The source.system field",
			choices: ["threat-signals"],
		})
		.option("source-title", {
			type: "string",
			description:
				"Threat Signals article title; null for historical provenance without a stored title.",
		})
		.option("tags", {
			type: "string",
			array: true,
			description: "The tags field",
		})
		.option("target-country", {
			type: "string",
			description: "The targetCountry field",
		})
		.option("target-industry", {
			type: "string",
			description: "The targetIndustry field",
		})
		.option("tlp", { type: "string", description: "The tlp field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"source-resource-id",
				"source-resource-type",
				"source-system",
				"source-title",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
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
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"post_EventCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <account-id-path>",
	describe: "Creates a new event",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-events create",
				classification: {
					safeFlags: ["source-resource-type", "source-system", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cloudforce-one threat-events create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${argv["account-id-path"] == null ? "<account-id-path>" : encodeURIComponent(String(argv["account-id-path"]))}/cloudforce-one/events/create`,
						pathParams: {
							"account-id-path": String(argv["account-id-path"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
											resourceType: resolveFileToken(
												argv["source-resource-type"] as string | undefined,
												"source-resource-type",
												"text"
											),
											system: resolveFileToken(
												argv["source-system"] as string | undefined,
												"source-system",
												"text"
											),
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.cloudforceOne.threatEvents.create({
							...bodyData,
							account_id_path: argv["account-id-path"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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
				if (argv["tlp"] === undefined) {
					argv["tlp"] = await promptForRequiredField("tlp", "The tlp field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						resourceType: resolveFileToken(
							argv["source-resource-type"] as string | undefined,
							"source-resource-type",
							"text"
						),
						system: resolveFileToken(
							argv["source-system"] as string | undefined,
							"source-system",
							"text"
						),
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.threatEvents.create({
						...bodyData,
						account_id_path: argv["account-id-path"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
