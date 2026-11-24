import operation from "../_operations/csam-scanner/edit.js";
/**
 * edit command
 * @generated from apis/overlays/csam-scanner.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Update CSAM Scanner setting",
	usage:
		"$0 csam-scanner edit\n\nUpdate the CSAM Scanner configuration for a zone. Allows enabling or disabling CSAM scanning, updating the notification email, and configuring scanning sources. This is a partial update: fields omitted from `value` keep their current setting, and `sources` is merged per source (`null` clears all sources). Send an empty `email` to clear the notification address. When a new email is provided, email verification is triggered automatically. The `enabled` field is a toggle; the server may adjust it based on whether the notification email is verified. Returns 403 if the zone or account is locked by Trust & Safety.",
	flags: {
		id: {
			kind: "parsed",
			brief: "The feature identifier.",
			optional: true,
			choices: ["csam_scanner"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "id", "text"),
		},
		"value-email": {
			kind: "parsed",
			brief:
				"Notification email address for CSAM scan results. When changed,\nemail verification is triggered automatically.\n",
			optional: true,
			parse: String,
		},
		"value-enabled": {
			kind: "boolean",
			brief: "Whether CSAM scanning is enabled for this zone.",
			optional: true,
		},
		"value-resend-email": {
			kind: "boolean",
			brief:
				"Set to true to trigger re-sending the email verification.\nWrite-only; never appears in responses (omitted when false).\n",
			optional: true,
		},
		"value-sources": {
			kind: "parsed",
			brief:
				'Map of scanning sources and their enabled state. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": boolean}.',
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
			brief: "Request body for updating CSAM Scanner configuration. ",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "csam-scanner edit",
				classification: {
					safeFlags: ["id", "value-enabled", "value-resend-email", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf csam-scanner edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/csam_scanner_third_party`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											id: argv["id"],
											value: {
												email: resolveFileToken(
													argv["value-email"] as string | undefined,
													"value-email",
													"text"
												),
												enabled: argv["value-enabled"],
												resend_email: argv["value-resend-email"],
												sources: parseJsonMap(
													argv["value-sources"],
													"value-sources"
												),
											},
										},
										[["value", "sources"]]
									),
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
				const bodyData = compactBody(
					{
						id: argv["id"],
						value: {
							email: resolveFileToken(
								argv["value-email"] as string | undefined,
								"value-email",
								"text"
							),
							enabled: argv["value-enabled"],
							resend_email: argv["value-resend-email"],
							sources: parseJsonMap(argv["value-sources"], "value-sources"),
						},
					},
					[["value", "sources"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
