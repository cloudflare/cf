import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zones automatic-platform-optimization edit\n\nAutomatic Platform Optimization (APO) for WordPress is a performance feature that serves your WordPress site from Cloudflare's edge network, reducing load times for visitors. Refer to the APO documentation for more information."
		)
		.option("value-cache-by-device-type", {
			type: "boolean",
			description: "Whether to cache by device type.",
		})
		.option("value-cf", {
			type: "boolean",
			description: "Whether the zone is proxied through Cloudflare.",
		})
		.option("value-enabled", {
			type: "boolean",
			description: "Whether APO is enabled.",
		})
		.option("value-hostnames", {
			type: "string",
			array: true,
			description: "List of hostnames where APO is active.",
		})
		.option("value-recheck", {
			type: "boolean",
			description: "Whether to recheck WordPress and plugin detection.",
		})
		.option("value-wordpress", {
			type: "boolean",
			description: "Whether the site is a WordPress site.",
		})
		.option("value-wp-plugin", {
			type: "boolean",
			description: "Whether the Cloudflare WordPress plugin is installed.",
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
		.implies("value-cf", [
			"value-enabled",
			"value-wordpress",
			"value-wp-plugin",
		])
		.implies("value-enabled", [
			"value-cf",
			"value-wordpress",
			"value-wp-plugin",
		])
		.implies("value-wordpress", [
			"value-cf",
			"value-enabled",
			"value-wp-plugin",
		])
		.implies("value-wp-plugin", [
			"value-cf",
			"value-enabled",
			"value-wordpress",
		]);
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"zone-settings-change-automatic-platform-optimization-setting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Change Automatic Platform Optimization setting",
	builder,
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
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zones.automaticPlatformOptimization.edit({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.zones.automaticPlatformOptimization.edit({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
