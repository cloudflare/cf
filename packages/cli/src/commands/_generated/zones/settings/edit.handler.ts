import operation from "../../_operations/zones/settings/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
											enabled: argv["value-strict-transport-security-enabled"],
											include_subdomains:
												argv[
													"value-strict-transport-security-include-subdomains"
												],
											max_age: argv["value-strict-transport-security-max-age"],
											nosniff: argv["value-strict-transport-security-nosniff"],
											preload: argv["value-strict-transport-security-preload"],
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
	);
}
