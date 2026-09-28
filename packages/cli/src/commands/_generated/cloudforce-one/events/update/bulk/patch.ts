import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * patch command
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
			"$0 cloudforce-one events update bulk patch\n\nUpdates multiple events with the same field values. Maximum 100 events per request."
		)
		.option("dataset-id", {
			type: "string",
			description:
				"Dataset ID containing the events to update. Required to prevent cross-account modifications.",
		})
		.option("event-ids", {
			type: "string",
			array: true,
			description: "List of event UUIDs to update (1-100)",
		})
		.option("updates-attacker", {
			type: "string",
			description: "The updates.attacker field",
		})
		.option("updates-attacker-country", {
			type: "string",
			description: "The updates.attackerCountry field",
		})
		.option("updates-category", {
			type: "string",
			description: "The updates.category field",
		})
		.option("updates-created-at", {
			type: "string",
			description: "The updates.createdAt field",
		})
		.option("updates-event", {
			type: "string",
			description: "The updates.event field",
		})
		.option("updates-indicator", {
			type: "string",
			description: "The updates.indicator field",
		})
		.option("updates-indicator-type", {
			type: "string",
			description: "The updates.indicatorType field",
		})
		.option("updates-insight", {
			type: "string",
			description: "The updates.insight field",
		})
		.option("updates-raw-source", {
			type: "string",
			description: "The updates.raw.source field",
		})
		.option("updates-raw-tlp", {
			type: "string",
			description: "The updates.raw.tlp field",
		})
		.option("updates-target-country", {
			type: "string",
			description: "The updates.targetCountry field",
		})
		.option("updates-target-industry", {
			type: "string",
			description: "The updates.targetIndustry field",
		})
		.option("updates-tlp", {
			type: "string",
			description: "The updates.tlp field",
		})
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

type Request = SdkRequest<"patch_EventUpdateBulk">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "patch",
	describe: "Bulk update events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events update bulk patch",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events update bulk patch",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/update/bulk`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
						client.cloudforceOne.events.update.bulk.patch({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.events.update.bulk.patch({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
