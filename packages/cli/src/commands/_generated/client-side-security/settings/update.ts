import operation from "../../_operations/client-side-security/settings/update.js";
/**
 * update command
 * @generated from apis/overlays/client-side-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update client-side security settings",
	usage:
		"$0 client-side-security settings update\n\nUpdates client-side security enablement and reporting behaviors for the zone.",
	flags: {
		enabled: {
			kind: "boolean",
			brief: "When true, indicates that Client-Side Security is enabled.",
			optional: true,
		},
		"use-cloudflare-reporting-endpoint": {
			kind: "boolean",
			brief:
				"When true, CSP reports will be sent to https://csp-reporting.cloudflare.com/cdn-cgi/script_monitor/report",
			optional: true,
		},
		"use-connection-url-path": {
			kind: "boolean",
			brief:
				"When true, the paths associated with connections URLs will also be analyzed.",
			optional: true,
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
				command: "client-side-security settings update",
				classification: {
					safeFlags: [
						"enabled",
						"use-cloudflare-reporting-endpoint",
						"use-connection-url-path",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf client-side-security settings update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/page_shield`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										use_cloudflare_reporting_endpoint:
											argv["use-cloudflare-reporting-endpoint"],
										use_connection_url_path: argv["use-connection-url-path"],
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
					enabled: argv["enabled"],
					use_cloudflare_reporting_endpoint:
						argv["use-cloudflare-reporting-endpoint"],
					use_connection_url_path: argv["use-connection-url-path"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
