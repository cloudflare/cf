import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zones settings edit <setting-id>\n\nUpdates a single zone setting by the identifier"
		)
		.positional("setting-id", {
			type: "string",
			description: "Setting name",
			demandOption: true,
		})
		.option("enabled", {
			type: "boolean",
			description: "ssl-recommender enrollment setting.",
		})
		.option("value-enabled", {
			type: "boolean",
			description: "Whether the feature is enabled or not.",
		})
		.option("value-pool-id", {
			type: "string",
			description:
				"Egress pool id which refers to a grouping of dedicated egress IPs through which Cloudflare will connect to origin.",
		})
		.option("value-cache-by-device-type", {
			type: "boolean",
			description:
				"Indicates whether or not [cache by device type](https://developers.cloudflare.com/automatic-platform-optimization/reference/cache-device-type/) is enabled.",
		})
		.option("value-cf", {
			type: "boolean",
			description: "Indicates whether or not Cloudflare proxy is enabled.",
		})
		.option("value-hostnames", {
			type: "string",
			array: true,
			description:
				"An array of hostnames where Automatic Platform Optimization for WordPress is activated.",
		})
		.option("value-wordpress", {
			type: "boolean",
			description: "Indicates whether or not site is powered by WordPress.",
		})
		.option("value-wp-plugin", {
			type: "boolean",
			description:
				"Indicates whether or not [Cloudflare for WordPress plugin](https://wordpress.org/plugins/cloudflare/) is installed.",
		})
		.option("value-strict-transport-security-enabled", {
			type: "boolean",
			description: "Whether or not strict transport security is enabled.",
		})
		.option("value-strict-transport-security-include-subdomains", {
			type: "boolean",
			description: "Include all subdomains for strict transport security.",
		})
		.option("value-strict-transport-security-max-age", {
			type: "number",
			description: "Max age in seconds of the strict transport security.",
		})
		.option("value-strict-transport-security-nosniff", {
			type: "boolean",
			description:
				"Whether or not to include 'X-Content-Type-Options: nosniff' header.",
		})
		.option("value-strict-transport-security-preload", {
			type: "boolean",
			description: "Enable automatic preload of the HSTS configuration.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("value-pool-id", [
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		])
		.conflicts("value-cache-by-device-type", [
			"value-pool-id",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		])
		.implies("value-cache-by-device-type", [
			"value-strict-transport-security-enabled",
			"value-cf",
			"value-wordpress",
			"value-wp-plugin",
			"value-hostnames",
		])
		.conflicts("value-cf", [
			"value-pool-id",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		])
		.implies("value-cf", [
			"value-strict-transport-security-enabled",
			"value-wordpress",
			"value-wp-plugin",
			"value-hostnames",
			"value-cache-by-device-type",
		])
		.conflicts("value-hostnames", [
			"value-pool-id",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		])
		.implies("value-hostnames", [
			"value-strict-transport-security-enabled",
			"value-cf",
			"value-wordpress",
			"value-wp-plugin",
			"value-cache-by-device-type",
		])
		.conflicts("value-wordpress", [
			"value-pool-id",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		])
		.implies("value-wordpress", [
			"value-strict-transport-security-enabled",
			"value-cf",
			"value-wp-plugin",
			"value-hostnames",
			"value-cache-by-device-type",
		])
		.conflicts("value-wp-plugin", [
			"value-pool-id",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		])
		.implies("value-wp-plugin", [
			"value-strict-transport-security-enabled",
			"value-cf",
			"value-wordpress",
			"value-hostnames",
			"value-cache-by-device-type",
		])
		.implies("value-strict-transport-security-enabled", [
			"value-cf",
			"value-wordpress",
			"value-wp-plugin",
			"value-hostnames",
			"value-cache-by-device-type",
		])
		.conflicts("value-strict-transport-security-include-subdomains", [
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		])
		.conflicts("value-strict-transport-security-max-age", [
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		])
		.conflicts("value-strict-transport-security-nosniff", [
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		])
		.conflicts("value-strict-transport-security-preload", [
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"zone-settings-edit-single-setting">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <setting-id>",
	describe: "Edit zone setting",
	builder,
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
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zones.settings.edit({
							body: bodyData,
							zone_id: zoneId,
							setting_id: argv["setting-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.zones.settings.edit({
						body: bodyData,
						zone_id: zoneId,
						setting_id: argv["setting-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
