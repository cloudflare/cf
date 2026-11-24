import operation from "../../_operations/zones/settings/edit.js";
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
	command: "edit <setting-id>",
	describe: "Edit zone setting",
	usage:
		"$0 zones settings edit <setting-id>\n\nUpdates a single zone setting by the identifier",
	flags: {
		enabled: {
			kind: "boolean",
			brief: "ssl-recommender enrollment setting.",
			optional: true,
		},
		"value-enabled": {
			kind: "boolean",
			brief:
				"Variant descriptions:\n- Whether the feature is enabled or not.\n- Indicates whether or not Automatic Platform Optimization is enabled.",
			optional: true,
		},
		"value-pool-id": {
			kind: "parsed",
			brief:
				"Egress pool id which refers to a grouping of dedicated egress IPs through which Cloudflare will connect to origin.",
			optional: true,
			parse: String,
		},
		"value-cache-by-device-type": {
			kind: "boolean",
			brief:
				"Indicates whether or not [cache by device type](https://developers.cloudflare.com/automatic-platform-optimization/reference/cache-device-type/) is enabled.",
			optional: true,
		},
		"value-cf": {
			kind: "boolean",
			brief: "Indicates whether or not Cloudflare proxy is enabled.",
			optional: true,
		},
		"value-hostnames": {
			kind: "parsed",
			brief:
				"An array of hostnames where Automatic Platform Optimization for WordPress is activated.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-wordpress": {
			kind: "boolean",
			brief: "Indicates whether or not site is powered by WordPress.",
			optional: true,
		},
		"value-wp-plugin": {
			kind: "boolean",
			brief:
				"Indicates whether or not [Cloudflare for WordPress plugin](https://wordpress.org/plugins/cloudflare/) is installed.",
			optional: true,
		},
		"value-strict-transport-security-enabled": {
			kind: "boolean",
			brief: "Whether or not strict transport security is enabled.",
			optional: true,
		},
		"value-strict-transport-security-include-subdomains": {
			kind: "boolean",
			brief: "Include all subdomains for strict transport security.",
			optional: true,
		},
		"value-strict-transport-security-max-age": {
			kind: "parsed",
			brief: "Max age in seconds of the strict transport security.",
			optional: true,
			parse: Number,
		},
		"value-strict-transport-security-nosniff": {
			kind: "boolean",
			brief:
				"Whether or not to include 'X-Content-Type-Options: nosniff' header.",
			optional: true,
		},
		"value-strict-transport-security-preload": {
			kind: "boolean",
			brief: "Enable automatic preload of the HSTS configuration.",
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
	operands: [
		{ placeholder: "setting-id", brief: "Setting name", parse: String },
	],
	rules(rules) {
		rules.conflicts("value-enabled", [
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.conflicts("value-pool-id", [
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.conflicts("value-cache-by-device-type", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-cache-by-device-type", [
			"value-enabled",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-cf", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-cf", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-hostnames", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-hostnames", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-cf",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-wordpress", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-wordpress", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wp-plugin",
		]);
		rules.conflicts("value-wp-plugin", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-wp-plugin", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
		]);
		rules.conflicts("value-strict-transport-security-enabled", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-include-subdomains", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-max-age", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-nosniff", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-preload", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones settings edit",
				classification: {
					safeFlags: [
						"enabled",
						"value-enabled",
						"value-cache-by-device-type",
						"value-cf",
						"value-wordpress",
						"value-wp-plugin",
						"value-strict-transport-security-enabled",
						"value-strict-transport-security-include-subdomains",
						"value-strict-transport-security-nosniff",
						"value-strict-transport-security-preload",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones settings edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/${argv["setting-id"] == null ? "<setting-id>" : encodeURIComponent(String(argv["setting-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"setting-id": String(argv["setting-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										value: {
											enabled: argv["value-enabled"],
											pool_id: resolveFileToken(
												argv["value-pool-id"] as string | undefined,
												"value-pool-id",
												"text"
											),
											cache_by_device_type: argv["value-cache-by-device-type"],
											cf: argv["value-cf"],
											hostnames: argv["value-hostnames"],
											wordpress: argv["value-wordpress"],
											wp_plugin: argv["value-wp-plugin"],
											strict_transport_security: {
												enabled:
													argv["value-strict-transport-security-enabled"],
												include_subdomains:
													argv[
														"value-strict-transport-security-include-subdomains"
													],
												max_age:
													argv["value-strict-transport-security-max-age"],
												nosniff:
													argv["value-strict-transport-security-nosniff"],
												preload:
													argv["value-strict-transport-security-preload"],
											},
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
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							setting_id: argv["setting-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					enabled: argv["enabled"],
					value: {
						enabled: argv["value-enabled"],
						pool_id: resolveFileToken(
							argv["value-pool-id"] as string | undefined,
							"value-pool-id",
							"text"
						),
						cache_by_device_type: argv["value-cache-by-device-type"],
						cf: argv["value-cf"],
						hostnames: argv["value-hostnames"],
						wordpress: argv["value-wordpress"],
						wp_plugin: argv["value-wp-plugin"],
						strict_transport_security: {
							enabled: argv["value-strict-transport-security-enabled"],
							include_subdomains:
								argv["value-strict-transport-security-include-subdomains"],
							max_age: argv["value-strict-transport-security-max-age"],
							nosniff: argv["value-strict-transport-security-nosniff"],
							preload: argv["value-strict-transport-security-preload"],
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						setting_id: argv["setting-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
