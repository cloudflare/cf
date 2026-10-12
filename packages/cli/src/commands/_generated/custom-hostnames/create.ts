import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 custom-hostnames create\n\nAdd a new custom hostname and request that an SSL certificate be issued for it. One of three validation methods—http, txt, email—should be used, with 'http' recommended if the CNAME is already in place (or will be soon). Specifying 'email' will send an email to the WHOIS contacts on file for the base domain plus hostmaster, postmaster, webmaster, admin, administrator. If http is used and the domain is not already pointing to the Managed CNAME host, the PATCH method must be used once it is (to complete validation). Enable bundling of certificates using the custom_cert_bundle field. The bundling process requires the following condition One certificate in the bundle must use an RSA, and the other must use an ECDSA."
		)
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
		.option("hostname", {
			type: "string",
			description:
				"The custom hostname that will point to your hostname via CNAME.",
		})
		.option("ssl-bundle-method", {
			type: "string",
			description:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			choices: ["ubiquitous", "optimal", "force"],
		})
		.coerce("ssl-bundle-method", (value) =>
			resolveFileToken(value, "ssl-bundle-method", "text")
		)
		.option("ssl-certificate-authority", {
			type: "string",
			description: "The Certificate Authority that will issue the certificate.",
			choices: ["digicert", "google", "lets_encrypt", "ssl_com"],
		})
		.coerce("ssl-certificate-authority", (value) =>
			resolveFileToken(value, "ssl-certificate-authority", "text")
		)
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
		.coerce("ssl-method", (value) =>
			resolveFileToken(value, "ssl-method", "text")
		)
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
		.coerce("ssl-settings-early-hints", (value) =>
			resolveFileToken(value, "ssl-settings-early-hints", "text")
		)
		.option("ssl-settings-http2", {
			type: "string",
			description: "Whether or not HTTP2 is enabled.",
			choices: ["on", "off"],
		})
		.coerce("ssl-settings-http2", (value) =>
			resolveFileToken(value, "ssl-settings-http2", "text")
		)
		.option("ssl-settings-min-tls-version", {
			type: "string",
			description: "The minimum TLS version supported.",
			choices: ["1.0", "1.1", "1.2", "1.3"],
		})
		.coerce("ssl-settings-min-tls-version", (value) =>
			resolveFileToken(value, "ssl-settings-min-tls-version", "text")
		)
		.option("ssl-settings-tls-1-3", {
			type: "string",
			description: "Whether or not TLS 1.3 is enabled.",
			choices: ["on", "off"],
		})
		.coerce("ssl-settings-tls-1-3", (value) =>
			resolveFileToken(value, "ssl-settings-tls-1-3", "text")
		)
		.option("ssl-type", {
			type: "string",
			description:
				"Level of validation to be used for this hostname. Domain validation (dv) must be used.",
			choices: ["dv"],
		})
		.coerce("ssl-type", (value) => resolveFileToken(value, "ssl-type", "text"))
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

type Request = SdkRequest<"custom-hostname-for-a-zone-create-custom-hostname">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Custom Hostname",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames`,
						pathParams: {
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
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
										ssl: {
											bundle_method: argv["ssl-bundle-method"],
											certificate_authority: argv["ssl-certificate-authority"],
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
									}),
						sensitiveBodyPaths: [["ssl", "custom_key"]],
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
					const result = await withProgress(`Creating`, async () =>
						client.customHostnames.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["hostname"] === undefined) {
					argv["hostname"] = await promptForRequiredField(
						"hostname",
						"The custom hostname that will point to your hostname via CNAME."
					);
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
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
					ssl: {
						bundle_method: argv["ssl-bundle-method"],
						certificate_authority: argv["ssl-certificate-authority"],
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.customHostnames.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
