import operation from "../../_operations/workers-vpc/services/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "workers-vpc services update",
			classification: {
				safeFlags: ["type", "app-protocol", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type field",
						["tcp", "http"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf workers-vpc services update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/connectivity/directory/services/${argv["service-id"] == null ? "<service-id>" : encodeURIComponent(String(argv["service-id"]))}`,
					pathParams: { "service-id": String(argv["service-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									host: {
										ipv4: resolveFileToken(
											argv["host-ipv4"] as string | undefined,
											"host-ipv4",
											"text"
										),
										network: {
											tunnel_id: resolveFileToken(
												argv["host-network-tunnel-id"] as string | undefined,
												"host-network-tunnel-id",
												"text"
											),
										},
										ipv6: resolveFileToken(
											argv["host-ipv6"] as string | undefined,
											"host-ipv6",
											"text"
										),
										hostname: resolveFileToken(
											argv["host-hostname"] as string | undefined,
											"host-hostname",
											"text"
										),
										resolver_network: {
											resolver_ips: argv["host-resolver-network-resolver-ips"],
											tunnel_id: resolveFileToken(
												argv["host-resolver-network-tunnel-id"] as
													| string
													| undefined,
												"host-resolver-network-tunnel-id",
												"text"
											),
										},
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									tls_settings: {
										cert_verification_mode: resolveFileToken(
											argv["tls-settings-cert-verification-mode"] as
												| string
												| undefined,
											"tls-settings-cert-verification-mode",
											"text"
										),
										certificate_authority: resolveFileToken(
											argv["tls-settings-certificate-authority"] as
												| string
												| undefined,
											"tls-settings-certificate-authority",
											"text"
										),
										client_certificate: resolveFileToken(
											argv["tls-settings-client-certificate"] as
												| string
												| undefined,
											"tls-settings-client-certificate",
											"text"
										),
									},
									type: argv["type"],
									http_port: argv["http-port"],
									https_port: argv["https-port"],
									app_protocol: argv["app-protocol"],
									tcp_port: argv["tcp-port"],
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						service_id: argv["service-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				host: {
					ipv4: resolveFileToken(
						argv["host-ipv4"] as string | undefined,
						"host-ipv4",
						"text"
					),
					network: {
						tunnel_id: resolveFileToken(
							argv["host-network-tunnel-id"] as string | undefined,
							"host-network-tunnel-id",
							"text"
						),
					},
					ipv6: resolveFileToken(
						argv["host-ipv6"] as string | undefined,
						"host-ipv6",
						"text"
					),
					hostname: resolveFileToken(
						argv["host-hostname"] as string | undefined,
						"host-hostname",
						"text"
					),
					resolver_network: {
						resolver_ips: argv["host-resolver-network-resolver-ips"],
						tunnel_id: resolveFileToken(
							argv["host-resolver-network-tunnel-id"] as string | undefined,
							"host-resolver-network-tunnel-id",
							"text"
						),
					},
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				tls_settings: {
					cert_verification_mode: resolveFileToken(
						argv["tls-settings-cert-verification-mode"] as string | undefined,
						"tls-settings-cert-verification-mode",
						"text"
					),
					certificate_authority: resolveFileToken(
						argv["tls-settings-certificate-authority"] as string | undefined,
						"tls-settings-certificate-authority",
						"text"
					),
					client_certificate: resolveFileToken(
						argv["tls-settings-client-certificate"] as string | undefined,
						"tls-settings-client-certificate",
						"text"
					),
				},
				type: argv["type"],
				http_port: argv["http-port"],
				https_port: argv["https-port"],
				app_protocol: argv["app-protocol"],
				tcp_port: argv["tcp-port"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					service_id: argv["service-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
