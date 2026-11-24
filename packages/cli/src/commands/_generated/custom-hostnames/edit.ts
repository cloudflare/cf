import operation from "../_operations/custom-hostnames/edit.js";
/**
 * edit command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <custom-hostname-id>",
	describe: "Edit Custom Hostname",
	usage:
		"$0 custom-hostnames edit <custom-hostname-id>\n\nModify SSL configuration for a custom hostname. When sent with SSL config that matches existing config, used to indicate that hostname should pass domain control validation (DCV). Can also be used to change validation type, e.g., from 'http' to 'email'. Bundle an existing certificate with another certificate by using the \"custom_cert_bundle\" field. The bundling process supports combining certificates as long as the following condition is met. One certificate must use the RSA algorithm, and the other must use the ECDSA algorithm.",
	flags: {
		"custom-metadata": {
			kind: "parsed",
			brief:
				'Unique key/value metadata for this hostname. These are per-hostname (customer) settings. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"custom-origin-server": {
			kind: "parsed",
			brief:
				"a valid hostname that’s been added to your DNS zone as an A, AAAA, or CNAME record.",
			optional: true,
			parse: String,
		},
		"custom-origin-sni": {
			kind: "parsed",
			brief:
				"A hostname that will be sent to your custom origin server as SNI for TLS handshake. This can be a valid subdomain of the zone or custom origin server name or the string ':request_host_header:' which will cause the host header in the request to be used as SNI. Not configurable with default/fallback origin server.",
			optional: true,
			parse: String,
		},
		"ssl-bundle-method": {
			kind: "parsed",
			brief:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			optional: true,
			choices: ["ubiquitous", "optimal", "force"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-bundle-method", "text"),
		},
		"ssl-certificate-authority": {
			kind: "parsed",
			brief: "The Certificate Authority that will issue the certificate.",
			optional: true,
			choices: ["digicert", "google", "lets_encrypt", "ssl_com"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-certificate-authority", "text"),
		},
		"ssl-cloudflare-branding": {
			kind: "boolean",
			brief:
				"Whether or not to add Cloudflare Branding for the order.  This will add a subdomain of sni.cloudflaressl.com as the Common Name if set to true.",
			optional: true,
		},
		"ssl-custom-cert-bundle": {
			kind: "parsed",
			brief:
				'Array of custom certificate and key pairs (1 or 2 pairs allowed). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"custom_certificate": string, "custom_key": string}].',
			optional: true,
			parse: String,
		},
		"ssl-custom-certificate": {
			kind: "parsed",
			brief: "If a custom uploaded certificate is used.",
			optional: true,
			parse: String,
		},
		"ssl-custom-csr-id": {
			kind: "parsed",
			brief: "The identifier for the Custom CSR that was used.",
			optional: true,
			parse: String,
		},
		"ssl-custom-key": {
			kind: "parsed",
			brief: "The key for a custom uploaded certificate.",
			optional: true,
			parse: String,
		},
		"ssl-method": {
			kind: "parsed",
			brief: "Domain control validation (DCV) method used for this hostname.",
			optional: true,
			choices: ["http", "txt", "email"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ssl-method", "text"),
		},
		"ssl-settings-ciphers": {
			kind: "parsed",
			brief:
				"An allowlist of ciphers for TLS termination. These ciphers must be in the BoringSSL format.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ssl-settings-early-hints": {
			kind: "parsed",
			brief: "Whether or not Early Hints is enabled.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-early-hints", "text"),
		},
		"ssl-settings-http2": {
			kind: "parsed",
			brief: "Whether or not HTTP2 is enabled.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-http2", "text"),
		},
		"ssl-settings-min-tls-version": {
			kind: "parsed",
			brief: "The minimum TLS version supported.",
			optional: true,
			choices: ["1.0", "1.1", "1.2", "1.3"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-min-tls-version", "text"),
		},
		"ssl-settings-tls-1-3": {
			kind: "parsed",
			brief: "Whether or not TLS 1.3 is enabled.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-tls-1-3", "text"),
		},
		"ssl-type": {
			kind: "parsed",
			brief:
				"Level of validation to be used for this hostname. Domain validation (dv) must be used.",
			optional: true,
			choices: ["dv"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ssl-type", "text"),
		},
		"ssl-wildcard": {
			kind: "boolean",
			brief: "Indicates whether the certificate covers a wildcard.",
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
		{
			placeholder: "custom-hostname-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-hostnames edit",
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
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames/${argv["custom-hostname-id"] == null ? "<custom-hostname-id>" : encodeURIComponent(String(argv["custom-hostname-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"custom-hostname-id": String(argv["custom-hostname-id"] ?? ""),
						},
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
											ssl: {
												bundle_method: argv["ssl-bundle-method"],
												certificate_authority:
													argv["ssl-certificate-authority"],
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							custom_hostname_id: argv["custom-hostname-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						custom_hostname_id: argv["custom-hostname-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
