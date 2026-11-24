import operation from "../../../_operations/zero-trust/dlp/data-classes/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <data-class-id>",
	describe: "Update the attributes of a single data class",
	usage:
		"$0 zero-trust dlp data-classes update <data-class-id>\n\nUpdates the configuration for a data class.",
	flags: {
		"data-tags": {
			kind: "parsed",
			brief: "The data_tags field",
			variadic: true,
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		expression: {
			kind: "parsed",
			brief: "The expression field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"sensitivity-levels": {
			kind: "parsed",
			brief:
				'The sensitivity_levels field. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"group_id": string, "level_id": string}].',
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
			brief: "Attributes of the data class to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "data-class-id", brief: "Data class ID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp data-classes update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp data-classes update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/data_classes/${argv["data-class-id"] == null ? "<data-class-id>" : encodeURIComponent(String(argv["data-class-id"]))}`,
						pathParams: {
							"data-class-id": String(argv["data-class-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										data_tags: argv["data-tags"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										sensitivity_levels: parseObjectArray(
											argv["sensitivity-levels"],
											"sensitivity-levels",
											true
										),
									}),
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
							data_class_id: argv["data-class-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					data_tags: argv["data-tags"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					sensitivity_levels: parseObjectArray(
						argv["sensitivity-levels"],
						"sensitivity-levels",
						true
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						data_class_id: argv["data-class-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
