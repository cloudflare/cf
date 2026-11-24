import operation from "../../_operations/tunnels/config/update.js";
/**
 * update command
 * @generated from apis/overlays/tunnels.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <tunnel-id>",
	describe: "Update Tunnel configuration",
	usage:
		"$0 tunnels config update <tunnel-id>\n\nReplaces the configuration for a remotely managed Cloudflare Tunnel, including its ingress rules and origin request settings.",
	flags: {
		"tunnel-config-ingress": {
			kind: "parsed",
			brief:
				'List of public hostname definitions. At least one ingress rule needs to be defined for the tunnel. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"hostname": string, "service": string, "originRequest"?: {...}, "path"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-access-aud-tag": {
			kind: "parsed",
			brief:
				"Access applications that are allowed to reach this hostname for this Tunnel. Audience tags can be identified in the dashboard or via the List Access policies API.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-access-required": {
			kind: "boolean",
			brief: "Deny traffic that has not fulfilled Access authorization.",
			optional: true,
		},
		"tunnel-config-origin-request-access-team-name": {
			kind: "parsed",
			brief: "The config.originRequest.access.teamName field",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-ca-pool": {
			kind: "parsed",
			brief:
				"Path to the certificate authority (CA) for the certificate of your origin. This option should be used only if your certificate is not signed by Cloudflare.",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-connect-timeout": {
			kind: "parsed",
			brief:
				"Timeout for establishing a new TCP connection to your origin server. This excludes the time taken to establish TLS, which is controlled by tlsTimeout.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-disable-chunked-encoding": {
			kind: "boolean",
			brief:
				"Disables chunked transfer encoding. Useful if you are running a WSGI server.",
			optional: true,
		},
		"tunnel-config-origin-request-http2origin": {
			kind: "boolean",
			brief:
				"Attempt to connect to origin using HTTP2. Origin must be configured as https.",
			optional: true,
		},
		"tunnel-config-origin-request-http-host-header": {
			kind: "parsed",
			brief: "Sets the HTTP Host header on requests sent to the local service.",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-keep-alive-connections": {
			kind: "parsed",
			brief:
				"Maximum number of idle keepalive connections between Tunnel and your origin. This does not restrict the total number of concurrent connections.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-keep-alive-timeout": {
			kind: "parsed",
			brief:
				"Timeout after which an idle keepalive connection can be discarded.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-match-snito-host": {
			kind: "boolean",
			brief: "Auto configure the Hostname on the origin server certificate.",
			optional: true,
		},
		"tunnel-config-origin-request-no-happy-eyeballs": {
			kind: "boolean",
			brief:
				"Disable the “happy eyeballs” algorithm for IPv4/IPv6 fallback if your local network has misconfigured one of the protocols.",
			optional: true,
		},
		"tunnel-config-origin-request-no-tlsverify": {
			kind: "boolean",
			brief:
				"Disables TLS verification of the certificate presented by your origin. Will allow any certificate from the origin to be accepted.",
			optional: true,
		},
		"tunnel-config-origin-request-origin-server-name": {
			kind: "parsed",
			brief:
				"Hostname that cloudflared should expect from your origin server certificate.",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-proxy-type": {
			kind: "parsed",
			brief:
				'cloudflared starts a proxy server to translate HTTP traffic into TCP when proxying, for example, SSH or RDP. This configures what type of proxy will be started. Valid options are: "" for the regular proxy and "socks" for a SOCKS5 proxy.\n',
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-tcp-keep-alive": {
			kind: "parsed",
			brief:
				"The timeout after which a TCP keepalive packet is sent on a connection between Tunnel and the origin server.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-tls-timeout": {
			kind: "parsed",
			brief:
				"Timeout for completing a TLS handshake to your origin server, if you have chosen to connect Tunnel to an HTTPS server.",
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
	operands: [
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"tunnel-config-origin-request-access-aud-tag",
				"tunnel-config-origin-request-access-required",
				"tunnel-config-origin-request-access-team-name",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"tunnel-config-origin-request-access-aud-tag",
					"tunnel-config-origin-request-access-team-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when one of --tunnel-config-origin-request-access-aud-tag, --tunnel-config-origin-request-access-required, --tunnel-config-origin-request-access-team-name is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels config update",
				classification: {
					safeFlags: [
						"tunnel-config-origin-request-access-required",
						"tunnel-config-origin-request-disable-chunked-encoding",
						"tunnel-config-origin-request-http2origin",
						"tunnel-config-origin-request-match-snito-host",
						"tunnel-config-origin-request-no-happy-eyeballs",
						"tunnel-config-origin-request-no-tlsverify",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tunnels config update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cfd_tunnel/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/configurations`,
						pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											ingress: parseObjectArray(
												argv["tunnel-config-ingress"],
												"tunnel-config-ingress"
											),
											originRequest: {
												access: {
													audTag:
														argv["tunnel-config-origin-request-access-aud-tag"],
													required:
														argv[
															"tunnel-config-origin-request-access-required"
														],
													teamName: resolveFileToken(
														argv[
															"tunnel-config-origin-request-access-team-name"
														] as string | undefined,
														"tunnel-config-origin-request-access-team-name",
														"text"
													),
												},
												caPool: resolveFileToken(
													argv["tunnel-config-origin-request-ca-pool"] as
														| string
														| undefined,
													"tunnel-config-origin-request-ca-pool",
													"text"
												),
												connectTimeout:
													argv["tunnel-config-origin-request-connect-timeout"],
												disableChunkedEncoding:
													argv[
														"tunnel-config-origin-request-disable-chunked-encoding"
													],
												http2Origin:
													argv["tunnel-config-origin-request-http2origin"],
												httpHostHeader: resolveFileToken(
													argv[
														"tunnel-config-origin-request-http-host-header"
													] as string | undefined,
													"tunnel-config-origin-request-http-host-header",
													"text"
												),
												keepAliveConnections:
													argv[
														"tunnel-config-origin-request-keep-alive-connections"
													],
												keepAliveTimeout:
													argv[
														"tunnel-config-origin-request-keep-alive-timeout"
													],
												matchSNItoHost:
													argv["tunnel-config-origin-request-match-snito-host"],
												noHappyEyeballs:
													argv[
														"tunnel-config-origin-request-no-happy-eyeballs"
													],
												noTLSVerify:
													argv["tunnel-config-origin-request-no-tlsverify"],
												originServerName: resolveFileToken(
													argv[
														"tunnel-config-origin-request-origin-server-name"
													] as string | undefined,
													"tunnel-config-origin-request-origin-server-name",
													"text"
												),
												proxyType: resolveFileToken(
													argv["tunnel-config-origin-request-proxy-type"] as
														| string
														| undefined,
													"tunnel-config-origin-request-proxy-type",
													"text"
												),
												tcpKeepAlive:
													argv["tunnel-config-origin-request-tcp-keep-alive"],
												tlsTimeout:
													argv["tunnel-config-origin-request-tls-timeout"],
											},
										},
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
							tunnel_id: argv["tunnel-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					config: {
						ingress: parseObjectArray(
							argv["tunnel-config-ingress"],
							"tunnel-config-ingress"
						),
						originRequest: {
							access: {
								audTag: argv["tunnel-config-origin-request-access-aud-tag"],
								required: argv["tunnel-config-origin-request-access-required"],
								teamName: resolveFileToken(
									argv["tunnel-config-origin-request-access-team-name"] as
										| string
										| undefined,
									"tunnel-config-origin-request-access-team-name",
									"text"
								),
							},
							caPool: resolveFileToken(
								argv["tunnel-config-origin-request-ca-pool"] as
									| string
									| undefined,
								"tunnel-config-origin-request-ca-pool",
								"text"
							),
							connectTimeout:
								argv["tunnel-config-origin-request-connect-timeout"],
							disableChunkedEncoding:
								argv["tunnel-config-origin-request-disable-chunked-encoding"],
							http2Origin: argv["tunnel-config-origin-request-http2origin"],
							httpHostHeader: resolveFileToken(
								argv["tunnel-config-origin-request-http-host-header"] as
									| string
									| undefined,
								"tunnel-config-origin-request-http-host-header",
								"text"
							),
							keepAliveConnections:
								argv["tunnel-config-origin-request-keep-alive-connections"],
							keepAliveTimeout:
								argv["tunnel-config-origin-request-keep-alive-timeout"],
							matchSNItoHost:
								argv["tunnel-config-origin-request-match-snito-host"],
							noHappyEyeballs:
								argv["tunnel-config-origin-request-no-happy-eyeballs"],
							noTLSVerify: argv["tunnel-config-origin-request-no-tlsverify"],
							originServerName: resolveFileToken(
								argv["tunnel-config-origin-request-origin-server-name"] as
									| string
									| undefined,
								"tunnel-config-origin-request-origin-server-name",
								"text"
							),
							proxyType: resolveFileToken(
								argv["tunnel-config-origin-request-proxy-type"] as
									| string
									| undefined,
								"tunnel-config-origin-request-proxy-type",
								"text"
							),
							tcpKeepAlive: argv["tunnel-config-origin-request-tcp-keep-alive"],
							tlsTimeout: argv["tunnel-config-origin-request-tls-timeout"],
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
