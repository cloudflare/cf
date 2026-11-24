import operation from "../../../../_operations/cloudforce-one/threat-intel/indicators/relationships/update.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <rel-uuid>",
	describe: "Update an indicator relationship",
	usage:
		"$0 cloudforce-one threat-intel indicators relationships update <rel-uuid>\n\nUpdates the given fields of an indicator relationship and leaves the other fields unchanged.",
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
		"indicator-id": { kind: "parsed", brief: "Indicator UUID.", parse: String },
		confidence: {
			kind: "parsed",
			brief: "Updated confidence. null clears it.",
			optional: true,
			parse: Number,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Updated metadata. null clears it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Updated relationship type.",
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
	operands: [
		{ placeholder: "rel-uuid", brief: "Relationship UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel indicators relationships update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-intel indicators relationships update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/${argv["indicator-id"] == null ? "<indicator-id>" : encodeURIComponent(String(argv["indicator-id"]))}/relationships/${argv["rel-uuid"] == null ? "<rel-uuid>" : encodeURIComponent(String(argv["rel-uuid"]))}`,
						pathParams: {
							"dataset-id": String(argv["dataset-id"] ?? ""),
							"indicator-id": String(argv["indicator-id"] ?? ""),
							"rel-uuid": String(argv["rel-uuid"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											confidence: argv["confidence"],
											metadata: parseJsonMap(argv["metadata"], "metadata"),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							dataset_id: argv["dataset-id"],
							indicator_id: argv["indicator-id"],
							rel_uuid: argv["rel-uuid"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						confidence: argv["confidence"],
						metadata: parseJsonMap(argv["metadata"], "metadata"),
						type: resolveFileToken(
							argv["type"] as string | undefined,
							"type",
							"text"
						),
					},
					[["metadata"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
						indicator_id: argv["indicator-id"],
						rel_uuid: argv["rel-uuid"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
