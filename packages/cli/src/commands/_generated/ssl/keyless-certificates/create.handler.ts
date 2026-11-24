import operation from "../../_operations/ssl/keyless-certificates/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ssl keyless-certificates create",
			classification: {
				safeFlags: ["bundle-method", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["certificate"] === undefined) {
					argv["certificate"] = await promptForRequiredField(
						"certificate",
						"The zone's SSL certificate or SSL certificate and intermediate(s)."
					);
				}
				if (argv["host"] === undefined) {
					argv["host"] = await promptForRequiredField(
						"host",
						"The keyless SSL name."
					);
				}
				if (argv["port"] === undefined) {
					throw new Error(
						"--port is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf ssl keyless-certificates create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/keyless_certificates`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									bundle_method: argv["bundle-method"],
									certificate: resolveFileToken(
										argv["certificate"] as string | undefined,
										"certificate",
										"text"
									),
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				bundle_method: argv["bundle-method"],
				certificate: resolveFileToken(
					argv["certificate"] as string | undefined,
					"certificate",
					"text"
				),
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
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
