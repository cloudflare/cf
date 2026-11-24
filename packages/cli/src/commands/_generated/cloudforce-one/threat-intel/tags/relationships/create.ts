import operation from "../../../../_operations/cloudforce-one/threat-intel/tags/relationships/create.js";
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
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
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

const command = apiCommand({
	command: "create <tag-uuid>",
	describe: "Create a tag relationship",
	usage:
		"$0 cloudforce-one threat-intel tags relationships create <tag-uuid>\n\nCreates a relationship from a tag to an event or indicator (`targetType`) in the dataset given by `datasetId`. Relationships between two tags are not supported.",
	flags: {
		confidence: {
			kind: "parsed",
			brief: "Confidence score 0–100.",
			optional: true,
			parse: Number,
		},
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset UUID where the relationship row will be stored (locates the Indicators DO).",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Arbitrary JSON metadata. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"target-id": {
			kind: "parsed",
			brief: "UUID of the target entity.",
			optional: true,
			parse: String,
		},
		"target-type": {
			kind: "parsed",
			brief:
				'Target type. "tag" is not allowed (tag↔tag relationships are not supported).',
			optional: true,
			choices: ["event", "indicator"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "target-type", "text"),
		},
		type: {
			kind: "parsed",
			brief: "Relationship type.",
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
	operands: [{ placeholder: "tag-uuid", brief: "Tag UUID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel tags relationships create",
				classification: {
					safeFlags: ["target-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel tags relationships create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/relationships`,
						pathParams: { "tag-uuid": String(argv["tag-uuid"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											confidence: argv["confidence"],
											datasetId: resolveFileToken(
												argv["dataset-id"] as string | undefined,
												"dataset-id",
												"text"
											),
											metadata: parseJsonMap(argv["metadata"], "metadata"),
											targetId: resolveFileToken(
												argv["target-id"] as string | undefined,
												"target-id",
												"text"
											),
											targetType: argv["target-type"],
											type: resolveFileToken(
												argv["type"] as string | undefined,
												"type",
												"text"
											),
										},
										[["metadata"]]
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							tag_uuid: argv["tag-uuid"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						confidence: argv["confidence"],
						datasetId: resolveFileToken(
							argv["dataset-id"] as string | undefined,
							"dataset-id",
							"text"
						),
						metadata: parseJsonMap(argv["metadata"], "metadata"),
						targetId: resolveFileToken(
							argv["target-id"] as string | undefined,
							"target-id",
							"text"
						),
						targetType: argv["target-type"],
						type: resolveFileToken(
							argv["type"] as string | undefined,
							"type",
							"text"
						),
					},
					[["metadata"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						tag_uuid: argv["tag-uuid"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
