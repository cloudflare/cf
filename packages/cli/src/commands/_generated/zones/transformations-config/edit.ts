import operation from "../../_operations/zones/transformations-config/edit.js";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
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
	describe: "Change Transformations configuration",
	usage:
		"$0 zones transformations-config edit\n\nUpdates one or more fields of the combined Transformations configuration for a zone. Omitted fields are left unchanged. The response always returns the full current state of all three sub-settings.",
	flags: {
		"value-allowed-origins": {
			kind: "parsed",
			brief:
				'Comma-separated list of allowed origin domains for image and video transformations.\nUse "*" to allow all origins (default).\n',
			optional: true,
			parse: String,
		},
		"value-c2pa": {
			kind: "parsed",
			brief: "Whether C2PA signing is enabled for image transformations.",
			optional: true,
			choices: ["off", "on"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value-c2pa", "text"),
		},
		"value-transformations": {
			kind: "parsed",
			brief:
				'Controls Image Transformations behavior:\n- "off": Feature disabled.\n- "on": Transformations enabled for same-zone images only.\n- "open": Transformations enabled for images from any origin.\n- "latest": Transformations enabled using the latest version.\n',
			optional: true,
			choices: ["off", "on", "open", "latest"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "value-transformations", "text"),
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
				command: "zones transformations-config edit",
				classification: {
					safeFlags: ["value-c2pa", "value-transformations", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones transformations-config edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/transformations_config`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: {
											allowed_origins: resolveFileToken(
												argv["value-allowed-origins"] as string | undefined,
												"value-allowed-origins",
												"text"
											),
											c2pa: argv["value-c2pa"],
											transformations: argv["value-transformations"],
										},
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
					value: {
						allowed_origins: resolveFileToken(
							argv["value-allowed-origins"] as string | undefined,
							"value-allowed-origins",
							"text"
						),
						c2pa: argv["value-c2pa"],
						transformations: argv["value-transformations"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
