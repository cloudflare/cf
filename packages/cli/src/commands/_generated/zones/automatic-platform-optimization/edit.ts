import operation from "../../_operations/zones/automatic-platform-optimization/edit.js";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
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
	command: "edit",
	describe: "Change Automatic Platform Optimization setting",
	usage:
		'$0 zones automatic-platform-optimization edit\n\nAutomatic Platform Optimization (APO) for WordPress is a performance feature that serves your WordPress site from Cloudflare\'s edge network, reducing load times for visitors. Refer to the APO documentation for more information. When an APO configuration already exists, fields omitted from an object `value` keep their current value, except `recheck`, which is false unless the request sends it. Setting `value` to `"off"` disables APO but keeps the detected zone/site/plugin facts. On the first write for a zone (no existing configuration) an object `value` must include `enabled`, `cf`, `wordpress` and `wp_plugin`; otherwise the request fails with error 1023. `"off"` is a no-op when no configuration exists.',
	flags: {
		"value-cache-by-device-type": {
			kind: "boolean",
			brief: "Whether to cache by device type.",
			optional: true,
		},
		"value-cf": {
			kind: "boolean",
			brief: "Whether the zone is proxied through Cloudflare.",
			optional: true,
		},
		"value-enabled": {
			kind: "boolean",
			brief: "Whether APO is enabled.",
			optional: true,
		},
		"value-hostnames": {
			kind: "parsed",
			brief: "List of hostnames where APO is active.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-recheck": {
			kind: "boolean",
			brief:
				"Whether to recheck WordPress and plugin detection. When an APO configuration already exists, an omitted `recheck` is false, not its stored value.",
			optional: true,
		},
		"value-wordpress": {
			kind: "boolean",
			brief: "Whether the site is a WordPress site.",
			optional: true,
		},
		"value-wp-plugin": {
			kind: "boolean",
			brief: "Whether the Cloudflare WordPress plugin is installed.",
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
				command: "zones automatic-platform-optimization edit",
				classification: {
					safeFlags: [
						"value-cache-by-device-type",
						"value-cf",
						"value-enabled",
						"value-recheck",
						"value-wordpress",
						"value-wp-plugin",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones automatic-platform-optimization edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/automatic_platform_optimization`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: {
											cache_by_device_type: argv["value-cache-by-device-type"],
											cf: argv["value-cf"],
											enabled: argv["value-enabled"],
											hostnames: argv["value-hostnames"],
											recheck: argv["value-recheck"],
											wordpress: argv["value-wordpress"],
											wp_plugin: argv["value-wp-plugin"],
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
						cache_by_device_type: argv["value-cache-by-device-type"],
						cf: argv["value-cf"],
						enabled: argv["value-enabled"],
						hostnames: argv["value-hostnames"],
						recheck: argv["value-recheck"],
						wordpress: argv["value-wordpress"],
						wp_plugin: argv["value-wp-plugin"],
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
