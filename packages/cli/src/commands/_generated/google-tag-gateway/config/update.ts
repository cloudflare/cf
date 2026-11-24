import operation from "../../_operations/google-tag-gateway/config/update.js";
/**
 * update command
 * @generated from apis/overlays/google-tag-gateway.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update Google Tag Gateway configuration",
	usage:
		"$0 google-tag-gateway config update\n\nUpdates the Google Tag Gateway configuration for a zone.",
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Enables or disables Google Tag Gateway for this zone.",
			optional: true,
		},
		endpoint: {
			kind: "parsed",
			brief:
				"Specifies the endpoint path for proxying Google Tag Manager requests. Use an absolute path starting with '/', with no nested paths and alphanumeric characters only (e.g. /metrics).",
			optional: true,
			parse: String,
		},
		"hide-original-ip": {
			kind: "boolean",
			brief:
				"Deprecated. This value is stored but has no effect on traffic. Optional in requests: if omitted, the previously stored value is kept. Responses always include it.",
			optional: true,
		},
		"measurement-id": {
			kind: "parsed",
			brief:
				"Specify the Google Tag Manager container or measurement ID (e.g. GTM-XXXXXXX or G-XXXXXXXXXX).",
			optional: true,
			parse: String,
		},
		"set-up-tag": {
			kind: "boolean",
			brief:
				"Set up the associated Google Tag on the zone automatically when enabled.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Google Tag Gateway configuration for a zone.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "google-tag-gateway config update",
				classification: {
					safeFlags: ["enabled", "hide-original-ip", "set-up-tag", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
					if (argv["endpoint"] === undefined) {
						argv["endpoint"] = await promptForRequiredField(
							"endpoint",
							"Specifies the endpoint path for proxying Google Tag Manager requests. Use an absolute path starting with '/', with no nested paths and alphanumeric characters only (e.g. /metrics)."
						);
					}
					if (argv["measurement-id"] === undefined) {
						argv["measurement-id"] = await promptForRequiredField(
							"measurement-id",
							"Specify the Google Tag Manager container or measurement ID (e.g. GTM-XXXXXXX or G-XXXXXXXXXX)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf google-tag-gateway config update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/google-tag-gateway/config`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										endpoint: resolveFileToken(
											argv["endpoint"] as string | undefined,
											"endpoint",
											"text"
										),
										hideOriginalIp: argv["hide-original-ip"],
										measurementId: resolveFileToken(
											argv["measurement-id"] as string | undefined,
											"measurement-id",
											"text"
										),
										setUpTag: argv["set-up-tag"],
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
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					enabled: argv["enabled"],
					endpoint: resolveFileToken(
						argv["endpoint"] as string | undefined,
						"endpoint",
						"text"
					),
					hideOriginalIp: argv["hide-original-ip"],
					measurementId: resolveFileToken(
						argv["measurement-id"] as string | undefined,
						"measurement-id",
						"text"
					),
					setUpTag: argv["set-up-tag"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
