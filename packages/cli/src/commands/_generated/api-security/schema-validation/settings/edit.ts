import operation from "../../../_operations/api-security/schema-validation/settings/edit.js";
/**
 * edit command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Edit global schema validation settings",
	usage:
		"$0 api-security schema-validation settings edit\n\nPartially updates global schema validation settings for a zone using PATCH semantics.",
	flags: {
		"validation-default-mitigation-action": {
			kind: "parsed",
			brief:
				'The default mitigation action used\nMitigation actions are as follows:\n\n  - `"log"` - log request when request does not conform to schema\n  - `"block"` - deny access to the site when request does not conform to schema\n  - `"none"` - skip running schema validation\n',
			optional: true,
			choices: ["none", "log", "block"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "validation-default-mitigation-action", "text"),
		},
		"validation-override-mitigation-action": {
			kind: "parsed",
			brief:
				'When set, this overrides both zone level and operation level mitigation actions.\n\n  - `"none"` - skip running schema validation entirely for the request\n  - `null` - clears any existing override\n',
			optional: true,
			choices: ["none"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"validation-override-mitigation-action",
					"text"
				),
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation settings edit",
				classification: {
					safeFlags: [
						"validation-default-mitigation-action",
						"validation-override-mitigation-action",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security schema-validation settings edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										validation_default_mitigation_action:
											argv["validation-default-mitigation-action"],
										validation_override_mitigation_action:
											argv["validation-override-mitigation-action"],
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
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					validation_default_mitigation_action:
						argv["validation-default-mitigation-action"],
					validation_override_mitigation_action:
						argv["validation-override-mitigation-action"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
