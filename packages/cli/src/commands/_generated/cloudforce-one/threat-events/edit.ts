import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
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
			"$0 cloudforce-one threat-events edit <event-id>\n\nPartially updates a threat event in Cloudforce One, modifying specific fields without replacing the entire event."
		)
		.positional("event-id", {
			type: "string",
			description: "Event UUID.",
			demandOption: true,
		})
		.option("attacker", { type: "string", description: "The attacker field" })
		.option("attacker-country", {
			type: "string",
			description: "The attackerCountry field",
		})
		.option("category", { type: "string", description: "The category field" })
		.option("created-at", {
			type: "string",
			description: "The createdAt field",
		})
		.option("dataset-id", {
			type: "string",
			description: "Dataset ID containing the event to update.",
		})
		.option("date", { type: "string", description: "The date field" })
		.option("event", { type: "string", description: "The event field" })
		.option("indicator", { type: "string", description: "The indicator field" })
		.option("indicator-type", {
			type: "string",
			description: "The indicatorType field",
		})
		.option("insight", { type: "string", description: "The insight field" })
		.option("raw-source", {
			type: "string",
			description: "The raw.source field",
		})
		.option("raw-tlp", { type: "string", description: "The raw.tlp field" })
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
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"patch_EventUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <event-id>",
	describe: "Updates an event",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-events edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-events edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}`,
						pathParams: { "event-id": String(argv["event-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
						client.cloudforceOne.threatEvents.edit({
							...bodyData,
							account_id: accountId,
							event_id: argv["event-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["dataset-id"] === undefined) {
					argv["dataset-id"] = await promptForRequiredField(
						"dataset-id",
						"Dataset ID containing the event to update."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.threatEvents.edit({
						...bodyData,
						account_id: accountId,
						event_id: argv["event-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
