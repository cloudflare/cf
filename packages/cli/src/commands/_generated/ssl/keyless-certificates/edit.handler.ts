import operation from "../../_operations/ssl/keyless-certificates/edit.js";
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
			command: "ssl keyless-certificates edit",
			classification: {
				safeFlags: ["enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf ssl keyless-certificates edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/keyless_certificates/${argv["keyless-certificate-id"] == null ? "<keyless-certificate-id>" : encodeURIComponent(String(argv["keyless-certificate-id"]))}`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"keyless-certificate-id": String(
							argv["keyless-certificate-id"] ?? ""
						),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									enabled: argv["enabled"],
									host: resolveFileToken(
										argv["host"] as string | undefined,
										"host",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									port: argv["port"],
									tunnel: {
										private_ip: resolveFileToken(
											argv["tunnel-private-ip"] as string | undefined,
											"tunnel-private-ip",
											"text"
										),
										vnet_id: resolveFileToken(
											argv["tunnel-vnet-id"] as string | undefined,
											"tunnel-vnet-id",
											"text"
										),
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
						keyless_certificate_id: argv["keyless-certificate-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				enabled: argv["enabled"],
				host: resolveFileToken(
					argv["host"] as string | undefined,
					"host",
					"text"
				),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				port: argv["port"],
				tunnel: {
					private_ip: resolveFileToken(
						argv["tunnel-private-ip"] as string | undefined,
						"tunnel-private-ip",
						"text"
					),
					vnet_id: resolveFileToken(
						argv["tunnel-vnet-id"] as string | undefined,
						"tunnel-vnet-id",
						"text"
					),
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					keyless_certificate_id: argv["keyless-certificate-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
