import operation from "../../_operations/workers-vpc/services/update.js";
/**
 * update command
 * @generated from apis/overlays/workers-vpc.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "update <service-id>",
	describe: "Update Workers VPC connectivity service",
	usage:
		"$0 workers-vpc services update <service-id>\n\nUpdates an existing Workers VPC connectivity service by its ID.",
	flags: {
		"host-ipv4": {
			kind: "parsed",
			brief: "The host.ipv4 field",
			optional: true,
			parse: String,
		},
		"host-network-tunnel-id": {
			kind: "parsed",
			brief: "The host.network.tunnel_id field",
			optional: true,
			parse: String,
		},
		"host-ipv6": {
			kind: "parsed",
			brief: "The host.ipv6 field",
			optional: true,
			parse: String,
		},
		"host-hostname": {
			kind: "parsed",
			brief: "The host.hostname field",
			optional: true,
			parse: String,
		},
		"host-resolver-network-resolver-ips": {
			kind: "parsed",
			brief: "The host.resolver_network.resolver_ips field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"host-resolver-network-tunnel-id": {
			kind: "parsed",
			brief: "The host.resolver_network.tunnel_id field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"tls-settings-cert-verification-mode": {
			kind: "parsed",
			brief:
				'TLS certificate verification mode for the connection to the origin.\n\n- `"verify_full"` — verify certificate chain and hostname (default)\n- `"verify_ca"` — verify certificate chain only, skip hostname check\n- `"disabled"` — do not verify the server certificate at all\n\n`disabled` cannot be combined with `certificate_authority`: a custom CA is\nonly used to verify the server certificate.',
			optional: true,
			parse: String,
		},
		"tls-settings-certificate-authority": {
			kind: "parsed",
			brief: "UUID of the custom CA certificate or chain.",
			optional: true,
			parse: String,
		},
		"tls-settings-client-certificate": {
			kind: "parsed",
			brief: "UUID of the mTLS client certificate and private key.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			choices: ["tcp", "http"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"http-port": {
			kind: "parsed",
			brief: "The http_port field",
			optional: true,
			parse: Number,
		},
		"https-port": {
			kind: "parsed",
			brief: "The https_port field",
			optional: true,
			parse: Number,
		},
		"app-protocol": {
			kind: "parsed",
			brief: "The app_protocol field",
			optional: true,
			choices: ["postgresql", "mysql"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "app-protocol", "text"),
		},
		"tcp-port": {
			kind: "parsed",
			brief: "The tcp_port field",
			optional: true,
			parse: Number,
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
	operands: [{ placeholder: "service-id", brief: "Service ID", parse: String }],
	rules(rules) {
		rules.conflicts("host-ipv4", [
			"host-hostname",
			"host-resolver-network-resolver-ips",
			"host-resolver-network-tunnel-id",
		]);
		rules.implies("host-ipv4", ["host-network-tunnel-id"]);
		rules.conflicts("host-network-tunnel-id", [
			"host-hostname",
			"host-resolver-network-resolver-ips",
			"host-resolver-network-tunnel-id",
		]);
		rules.conflicts("host-ipv6", [
			"host-hostname",
			"host-resolver-network-resolver-ips",
			"host-resolver-network-tunnel-id",
		]);
		rules.implies("host-ipv6", ["host-network-tunnel-id"]);
		rules.conflicts("host-hostname", [
			"host-ipv4",
			"host-network-tunnel-id",
			"host-ipv6",
		]);
		rules.implies("host-hostname", ["host-resolver-network-tunnel-id"]);
		rules.conflicts("host-resolver-network-resolver-ips", [
			"host-ipv4",
			"host-network-tunnel-id",
			"host-ipv6",
		]);
		rules.implies("host-resolver-network-resolver-ips", [
			"host-hostname",
			"host-resolver-network-tunnel-id",
		]);
		rules.conflicts("host-resolver-network-tunnel-id", [
			"host-ipv4",
			"host-network-tunnel-id",
			"host-ipv6",
		]);
		rules.implies("host-resolver-network-tunnel-id", ["host-hostname"]);
		rules.implies("tls-settings-certificate-authority", [
			"tls-settings-cert-verification-mode",
		]);
		rules.implies("tls-settings-client-certificate", [
			"tls-settings-cert-verification-mode",
		]);
		rules.conflicts("http-port", ["app-protocol", "tcp-port"]);
		rules.conflicts("https-port", ["app-protocol", "tcp-port"]);
		rules.conflicts("app-protocol", ["http-port", "https-port"]);
		rules.conflicts("tcp-port", ["http-port", "https-port"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
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
												resolver_ips:
													argv["host-resolver-network-resolver-ips"],
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
		),
});

export default command;
