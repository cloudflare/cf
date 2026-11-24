import operation from "../../../../_operations/api-security/schema-validation/settings/operations/update.js";
/**
 * update command
 * @generated from apis/overlays/api-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <operation-id>",
	describe: "Update per-operation schema validation setting",
	usage:
		"$0 api-security schema-validation settings operations update <operation-id>\n\nFully updates schema validation settings for a specific API operation.",
	flags: {
		"mitigation-action": {
			kind: "parsed",
			brief:
				'When set, this applies a mitigation action to this operation\n\n  - `"log"` - log request when request does not conform to schema for this operation\n  - `"block"` - deny access to the site when request does not conform to schema for this operation\n  - `"none"` - will skip mitigation for this operation\n  - `null` - clears any mitigation action\n',
			optional: true,
			choices: ["log", "block", "none"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "mitigation-action", "text"),
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
		{
			placeholder: "operation-id",
			brief: "Identifier for the operation",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation settings operations update",
				classification: {
					safeFlags: ["mitigation-action", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["mitigation-action"] === undefined) {
						argv["mitigation-action"] = await promptForRequiredEnumField(
							"mitigation-action",
							'When set, this applies a mitigation action to this operation    - \`"log"\` - log request when request does not conform to schema for this operation   - \`"block"\` - deny access to the site when request does not conform to schema for this operation   - \`"none"\` - will skip mitigation for this operation   - \`null\` - clears any mitigation action ',
							["log", "block", "none"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command:
							"cf api-security schema-validation settings operations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/settings/operations/${argv["operation-id"] == null ? "<operation-id>" : encodeURIComponent(String(argv["operation-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"operation-id": String(argv["operation-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										mitigation_action: argv["mitigation-action"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							operation_id: argv["operation-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					mitigation_action: argv["mitigation-action"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						operation_id: argv["operation-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
