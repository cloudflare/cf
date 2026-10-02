import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events dataset indicators relationships create <indicator-id>\n\nCreates a new relationship with the indicator as the source entity. Indicator↔indicator relationships are not supported."
		)
		.positional("indicator-id", {
			type: "string",
			description: "Indicator UUID.",
			demandOption: true,
		})
		.option("dataset-id", {
			type: "string",
			description: "Dataset UUID.",
			demandOption: true,
		})
		.option("confidence", {
			type: "number",
			description: "Confidence score 0–100.",
		})
		.option("target-id", {
			type: "string",
			description: "UUID of the target entity.",
		})
		.option("target-type", {
			type: "string",
			description:
				'Target type. "indicator" is not allowed (indicator↔indicator relationships are not supported).',
			choices: ["event", "tag"],
		})
		.option("type", { type: "string", description: "Relationship type." })
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

type Request = SdkRequest<"post_IndicatorRelationshipCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <indicator-id>",
	describe: "Create a relationship for an indicator",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"cloudforce-one events dataset indicators relationships create",
				classification: {
					safeFlags: ["target-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one events dataset indicators relationships create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/${argv["indicator-id"] == null ? "<indicator-id>" : encodeURIComponent(String(argv["indicator-id"]))}/relationships`,
						pathParams: {
							"dataset-id": String(argv["dataset-id"] ?? ""),
							"indicator-id": String(argv["indicator-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										confidence: argv["confidence"],
										targetId: resolveFileToken(
											argv["target-id"] as string | undefined,
											"target-id",
											"text"
										),
										targetType: resolveFileToken(
											argv["target-type"] as string | undefined,
											"target-type",
											"text"
										),
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
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
					const result = await withProgress(`Creating`, async () =>
						client.cloudforceOne.events.dataset.indicators.relationships.create(
							{
								...bodyData,
								account_id: accountId,
								dataset_id: argv["dataset-id"],
								indicator_id: argv["indicator-id"],
							} satisfies Request
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["target-id"] === undefined) {
					argv["target-id"] = await promptForRequiredField(
						"target-id",
						"UUID of the target entity."
					);
				}
				if (argv["target-type"] === undefined) {
					argv["target-type"] = await promptForRequiredEnumField(
						"target-type",
						'Target type. "indicator" is not allowed (indicator↔indicator relationships are not supported).',
						["event", "tag"] as const
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredField(
						"type",
						"Relationship type."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					confidence: argv["confidence"],
					targetId: resolveFileToken(
						argv["target-id"] as string | undefined,
						"target-id",
						"text"
					),
					targetType: resolveFileToken(
						argv["target-type"] as string | undefined,
						"target-type",
						"text"
					),
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.events.dataset.indicators.relationships.create({
						...bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
						indicator_id: argv["indicator-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
