import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/custom-hostnames.ts
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
			"$0 custom-hostnames edit <custom-hostname-id>\n\nModify SSL configuration for a custom hostname. When sent with SSL config that matches existing config, used to indicate that hostname should pass domain control validation (DCV). Can also be used to change validation type, e.g., from 'http' to 'email'. Bundle an existing certificate with another certificate by using the \"custom_cert_bundle\" field. The bundling process supports combining certificates as long as the following condition is met. One certificate must use the RSA algorithm, and the other must use the ECDSA algorithm."
		)
		.positional("custom-hostname-id", {
			type: "string",
			description: "Custom hostname identifier tag.",
			demandOption: true,
		})
		.option("custom-origin-server", {
			type: "string",
			description:
				"a valid hostname that’s been added to your DNS zone as an A, AAAA, or CNAME record.",
		})
		.option("custom-origin-sni", {
			type: "string",
			description:
				"A hostname that will be sent to your custom origin server as SNI for TLS handshake. This can be a valid subdomain of the zone or custom origin server name or the string ':request_host_header:' which will cause the host header in the request to be used as SNI. Not configurable with default/fallback origin server.",
		})
		.option("ssl-bundle-method", {
			type: "string",
			description:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			choices: ["ubiquitous", "optimal", "force"],
		})
		.option("ssl-certificate-authority", {
			type: "string",
			description: "The Certificate Authority that will issue the certificate.",
			choices: ["digicert", "google", "lets_encrypt", "ssl_com"],
		})
		.option("ssl-cloudflare-branding", {
			type: "boolean",
			description:
				"Whether or not to add Cloudflare Branding for the order.  This will add a subdomain of sni.cloudflaressl.com as the Common Name if set to true.",
		})
		.option("ssl-custom-certificate", {
			type: "string",
			description: "If a custom uploaded certificate is used.",
		})
		.option("ssl-custom-csr-id", {
			type: "string",
			description: "The identifier for the Custom CSR that was used.",
		})
		.option("ssl-custom-key", {
			type: "string",
			description: "The key for a custom uploaded certificate.",
		})
		.option("ssl-method", {
			type: "string",
			description:
				"Domain control validation (DCV) method used for this hostname.",
			choices: ["http", "txt", "email"],
		})
		.option("ssl-settings-ciphers", {
			type: "string",
			array: true,
			description:
				"An allowlist of ciphers for TLS termination. These ciphers must be in the BoringSSL format.",
		})
		.option("ssl-settings-early-hints", {
			type: "string",
			description: "Whether or not Early Hints is enabled.",
			choices: ["on", "off"],
		})
		.option("ssl-settings-http2", {
			type: "string",
			description: "Whether or not HTTP2 is enabled.",
			choices: ["on", "off"],
		})
		.option("ssl-settings-min-tls-version", {
			type: "string",
			description: "The minimum TLS version supported.",
			choices: ["1.0", "1.1", "1.2", "1.3"],
		})
		.option("ssl-settings-tls-1-3", {
			type: "string",
			description: "Whether or not TLS 1.3 is enabled.",
			choices: ["on", "off"],
		})
		.option("ssl-type", {
			type: "string",
			description:
				"Level of validation to be used for this hostname. Domain validation (dv) must be used.",
			choices: ["dv"],
		})
		.option("ssl-wildcard", {
			type: "boolean",
			description: "Indicates whether the certificate covers a wildcard.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"custom-hostname-for-a-zone-edit-custom-hostname">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <custom-hostname-id>",
	describe: "Edit Custom Hostname",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames/${argv["custom-hostname-id"] == null ? "<custom-hostname-id>" : encodeURIComponent(String(argv["custom-hostname-id"]))}`,
						pathParams: {
							"custom-hostname-id": String(argv["custom-hostname-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
											bundle_method: resolveFileToken(
												argv["ssl-bundle-method"] as string | undefined,
												"ssl-bundle-method",
												"text"
											),
											certificate_authority: resolveFileToken(
												argv["ssl-certificate-authority"] as string | undefined,
												"ssl-certificate-authority",
												"text"
											),
											cloudflare_branding: argv["ssl-cloudflare-branding"],
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
											method: resolveFileToken(
												argv["ssl-method"] as string | undefined,
												"ssl-method",
												"text"
											),
											settings: {
												ciphers: argv["ssl-settings-ciphers"],
												early_hints: resolveFileToken(
													argv["ssl-settings-early-hints"] as
														| string
														| undefined,
													"ssl-settings-early-hints",
													"text"
												),
												http2: resolveFileToken(
													argv["ssl-settings-http2"] as string | undefined,
													"ssl-settings-http2",
													"text"
												),
												min_tls_version: resolveFileToken(
													argv["ssl-settings-min-tls-version"] as
														| string
														| undefined,
													"ssl-settings-min-tls-version",
													"text"
												),
												tls_1_3: resolveFileToken(
													argv["ssl-settings-tls-1-3"] as string | undefined,
													"ssl-settings-tls-1-3",
													"text"
												),
											},
											type: resolveFileToken(
												argv["ssl-type"] as string | undefined,
												"ssl-type",
												"text"
											),
											wildcard: argv["ssl-wildcard"],
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
						client.customHostnames.edit({
							...bodyData,
							zone_id: zoneId,
							custom_hostname_id: argv["custom-hostname-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						bundle_method: resolveFileToken(
							argv["ssl-bundle-method"] as string | undefined,
							"ssl-bundle-method",
							"text"
						),
						certificate_authority: resolveFileToken(
							argv["ssl-certificate-authority"] as string | undefined,
							"ssl-certificate-authority",
							"text"
						),
						cloudflare_branding: argv["ssl-cloudflare-branding"],
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
						method: resolveFileToken(
							argv["ssl-method"] as string | undefined,
							"ssl-method",
							"text"
						),
						settings: {
							ciphers: argv["ssl-settings-ciphers"],
							early_hints: resolveFileToken(
								argv["ssl-settings-early-hints"] as string | undefined,
								"ssl-settings-early-hints",
								"text"
							),
							http2: resolveFileToken(
								argv["ssl-settings-http2"] as string | undefined,
								"ssl-settings-http2",
								"text"
							),
							min_tls_version: resolveFileToken(
								argv["ssl-settings-min-tls-version"] as string | undefined,
								"ssl-settings-min-tls-version",
								"text"
							),
							tls_1_3: resolveFileToken(
								argv["ssl-settings-tls-1-3"] as string | undefined,
								"ssl-settings-tls-1-3",
								"text"
							),
						},
						type: resolveFileToken(
							argv["ssl-type"] as string | undefined,
							"ssl-type",
							"text"
						),
						wildcard: argv["ssl-wildcard"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.customHostnames.edit({
						...bodyData,
						zone_id: zoneId,
						custom_hostname_id: argv["custom-hostname-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
