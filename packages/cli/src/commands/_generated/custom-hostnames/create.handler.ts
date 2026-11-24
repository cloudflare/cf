import operation from "../_operations/custom-hostnames/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "custom-hostnames create",
			classification: {
				safeFlags: [
					"ssl-bundle-method",
					"ssl-certificate-authority",
					"ssl-cloudflare-branding",
					"ssl-method",
					"ssl-settings-early-hints",
					"ssl-settings-http2",
					"ssl-settings-min-tls-version",
					"ssl-settings-tls-1-3",
					"ssl-type",
					"ssl-wildcard",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["hostname"] === undefined) {
					argv["hostname"] = await promptForRequiredField(
						"hostname",
						"The custom hostname that will point to your hostname via CNAME."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf custom-hostnames create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										custom_metadata: parseJsonMap(
											argv["custom-metadata"],
											"custom-metadata"
										),
										custom_origin_server: resolveFileToken(
											argv["custom-origin-server"] as string | undefined,
											"custom-origin-server",
											"text"
										),
										custom_origin_sni: resolveFileToken(
											argv["custom-origin-sni"] as string | undefined,
											"custom-origin-sni",
											"text"
										),
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
										ssl: {
											bundle_method: argv["ssl-bundle-method"],
											certificate_authority: argv["ssl-certificate-authority"],
											cloudflare_branding: argv["ssl-cloudflare-branding"],
											custom_cert_bundle: parseObjectArray(
												argv["ssl-custom-cert-bundle"],
												"ssl-custom-cert-bundle"
											),
											custom_certificate: resolveFileToken(
												argv["ssl-custom-certificate"] as string | undefined,
												"ssl-custom-certificate",
												"text"
											),
											custom_csr_id: resolveFileToken(
												argv["ssl-custom-csr-id"] as string | undefined,
												"ssl-custom-csr-id",
												"text"
											),
											custom_key: resolveFileToken(
												argv["ssl-custom-key"] as string | undefined,
												"ssl-custom-key",
												"text"
											),
											method: argv["ssl-method"],
											settings: {
												ciphers: argv["ssl-settings-ciphers"],
												early_hints: argv["ssl-settings-early-hints"],
												http2: argv["ssl-settings-http2"],
												min_tls_version: argv["ssl-settings-min-tls-version"],
												tls_1_3: argv["ssl-settings-tls-1-3"],
											},
											type: argv["ssl-type"],
											wildcard: argv["ssl-wildcard"],
										},
									},
									[["custom_metadata"]]
								),
					sensitiveBodyPaths: [["ssl", "custom_key"]],
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
			const bodyData = compactBody(
				{
					custom_metadata: parseJsonMap(
						argv["custom-metadata"],
						"custom-metadata"
					),
					custom_origin_server: resolveFileToken(
						argv["custom-origin-server"] as string | undefined,
						"custom-origin-server",
						"text"
					),
					custom_origin_sni: resolveFileToken(
						argv["custom-origin-sni"] as string | undefined,
						"custom-origin-sni",
						"text"
					),
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
					ssl: {
						bundle_method: argv["ssl-bundle-method"],
						certificate_authority: argv["ssl-certificate-authority"],
						cloudflare_branding: argv["ssl-cloudflare-branding"],
						custom_cert_bundle: parseObjectArray(
							argv["ssl-custom-cert-bundle"],
							"ssl-custom-cert-bundle"
						),
						custom_certificate: resolveFileToken(
							argv["ssl-custom-certificate"] as string | undefined,
							"ssl-custom-certificate",
							"text"
						),
						custom_csr_id: resolveFileToken(
							argv["ssl-custom-csr-id"] as string | undefined,
							"ssl-custom-csr-id",
							"text"
						),
						custom_key: resolveFileToken(
							argv["ssl-custom-key"] as string | undefined,
							"ssl-custom-key",
							"text"
						),
						method: argv["ssl-method"],
						settings: {
							ciphers: argv["ssl-settings-ciphers"],
							early_hints: argv["ssl-settings-early-hints"],
							http2: argv["ssl-settings-http2"],
							min_tls_version: argv["ssl-settings-min-tls-version"],
							tls_1_3: argv["ssl-settings-tls-1-3"],
						},
						type: argv["ssl-type"],
						wildcard: argv["ssl-wildcard"],
					},
				},
				[["custom_metadata"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
