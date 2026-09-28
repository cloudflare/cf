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
			"$0 cloudforce-one events tags relationships create <tag-uuid>\n\nCreates a new relationship with the tag as the source entity. Requires a datasetId to locate the Indicators DO."
		)
		.positional("tag-uuid", {
			type: "string",
			description: "Tag UUID.",
			demandOption: true,
		})
		.option("confidence", {
			type: "number",
			description: "Confidence score 0–100.",
		})
		.option("dataset-id", {
			type: "string",
			description:
				"Dataset UUID where the relationship row will be stored (locates the Indicators DO).",
		})
		.option("target-id", {
			type: "string",
			description: "UUID of the target entity.",
		})
		.option("target-type", {
			type: "string",
			description:
				'Target type. "tag" is not allowed (tag↔tag relationships are not supported).',
			choices: ["event", "indicator"],
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

type Request = SdkRequest<"post_TagRelationshipCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <tag-uuid>",
	describe: "Create a relationship for a tag",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events tags relationships create",
				classification: {
					safeFlags: ["target-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events tags relationships create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/relationships`,
						pathParams: { "tag-uuid": String(argv["tag-uuid"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										confidence: argv["confidence"],
										datasetId: resolveFileToken(
											argv["dataset-id"] as string | undefined,
											"dataset-id",
											"text"
										),
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
						client.cloudforceOne.events.tags.relationships.create({
							...bodyData,
							account_id: accountId,
							tag_uuid: argv["tag-uuid"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["dataset-id"] === undefined) {
					argv["dataset-id"] = await promptForRequiredField(
						"dataset-id",
						"Dataset UUID where the relationship row will be stored (locates the Indicators DO)."
					);
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
						'Target type. "tag" is not allowed (tag↔tag relationships are not supported).',
						["event", "indicator"] as const
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
					datasetId: resolveFileToken(
						argv["dataset-id"] as string | undefined,
						"dataset-id",
						"text"
					),
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
					client.cloudforceOne.events.tags.relationships.create({
						...bodyData,
						account_id: accountId,
						tag_uuid: argv["tag-uuid"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
