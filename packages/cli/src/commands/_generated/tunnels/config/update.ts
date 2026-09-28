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
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/tunnels.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 tunnels config update <tunnel-id>\n\nReplaces the configuration for a remotely managed Cloudflare Tunnel, including its ingress rules and origin request settings."
		)
		.positional("tunnel-id", {
			type: "string",
			description: "UUID of the tunnel.",
			demandOption: true,
		})
		.option("config-origin-request-access-aud-tag", {
			type: "string",
			array: true,
			description:
				"Access applications that are allowed to reach this hostname for this Tunnel. Audience tags can be identified in the dashboard or via the List Access policies API.",
		})
		.option("config-origin-request-access-required", {
			type: "boolean",
			description: "Deny traffic that has not fulfilled Access authorization.",
		})
		.option("config-origin-request-access-team-name", {
			type: "string",
			description: "The config.originRequest.access.teamName field",
		})
		.option("config-origin-request-ca-pool", {
			type: "string",
			description:
				"Path to the certificate authority (CA) for the certificate of your origin. This option should be used only if your certificate is not signed by Cloudflare.",
		})
		.option("config-origin-request-connect-timeout", {
			type: "number",
			description:
				"Timeout for establishing a new TCP connection to your origin server. This excludes the time taken to establish TLS, which is controlled by tlsTimeout.",
		})
		.option("config-origin-request-disable-chunked-encoding", {
			type: "boolean",
			description:
				"Disables chunked transfer encoding. Useful if you are running a WSGI server.",
		})
		.option("config-origin-request-http2origin", {
			type: "boolean",
			description:
				"Attempt to connect to origin using HTTP2. Origin must be configured as https.",
		})
		.option("config-origin-request-http-host-header", {
			type: "string",
			description:
				"Sets the HTTP Host header on requests sent to the local service.",
		})
		.option("config-origin-request-keep-alive-connections", {
			type: "number",
			description:
				"Maximum number of idle keepalive connections between Tunnel and your origin. This does not restrict the total number of concurrent connections.",
		})
		.option("config-origin-request-keep-alive-timeout", {
			type: "number",
			description:
				"Timeout after which an idle keepalive connection can be discarded.",
		})
		.option("config-origin-request-match-snito-host", {
			type: "boolean",
			description:
				"Auto configure the Hostname on the origin server certificate.",
		})
		.option("config-origin-request-no-happy-eyeballs", {
			type: "boolean",
			description:
				"Disable the “happy eyeballs” algorithm for IPv4/IPv6 fallback if your local network has misconfigured one of the protocols.",
		})
		.option("config-origin-request-no-tlsverify", {
			type: "boolean",
			description:
				"Disables TLS verification of the certificate presented by your origin. Will allow any certificate from the origin to be accepted.",
		})
		.option("config-origin-request-origin-server-name", {
			type: "string",
			description:
				"Hostname that cloudflared should expect from your origin server certificate.",
		})
		.option("config-origin-request-proxy-type", {
			type: "string",
			description:
				'cloudflared starts a proxy server to translate HTTP traffic into TCP when proxying, for example, SSH or RDP. This configures what type of proxy will be started. Valid options are: "" for the regular proxy and "socks" for a SOCKS5 proxy.\n',
		})
		.option("config-origin-request-tcp-keep-alive", {
			type: "number",
			description:
				"The timeout after which a TCP keepalive packet is sent on a connection between Tunnel and the origin server.",
		})
		.option("config-origin-request-tls-timeout", {
			type: "number",
			description:
				"Timeout for completing a TLS handshake to your origin server, if you have chosen to connect Tunnel to an HTTPS server.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"config-origin-request-access-aud-tag",
				"config-origin-request-access-required",
				"config-origin-request-access-team-name",
				"config-origin-request-ca-pool",
				"config-origin-request-connect-timeout",
				"config-origin-request-disable-chunked-encoding",
				"config-origin-request-http2origin",
				"config-origin-request-http-host-header",
				"config-origin-request-keep-alive-connections",
				"config-origin-request-keep-alive-timeout",
				"config-origin-request-match-snito-host",
				"config-origin-request-no-happy-eyeballs",
				"config-origin-request-no-tlsverify",
				"config-origin-request-origin-server-name",
				"config-origin-request-proxy-type",
				"config-origin-request-tcp-keep-alive",
				"config-origin-request-tls-timeout",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"config-origin-request-access-aud-tag",
					"config-origin-request-access-team-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --config-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"cloudflare-tunnel-configuration-put-configuration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <tunnel-id>",
	describe: "Update Tunnel configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels config update",
				classification: {
					safeFlags: [
						"config-origin-request-access-required",
						"config-origin-request-disable-chunked-encoding",
						"config-origin-request-http2origin",
						"config-origin-request-match-snito-host",
						"config-origin-request-no-happy-eyeballs",
						"config-origin-request-no-tlsverify",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
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
											originRequest: {
												access: {
													audTag: argv["config-origin-request-access-aud-tag"],
													required:
														argv["config-origin-request-access-required"],
													teamName: resolveFileToken(
														argv["config-origin-request-access-team-name"] as
															| string
															| undefined,
														"config-origin-request-access-team-name",
														"text"
													),
												},
												caPool: resolveFileToken(
													argv["config-origin-request-ca-pool"] as
														| string
														| undefined,
													"config-origin-request-ca-pool",
													"text"
												),
												connectTimeout:
													argv["config-origin-request-connect-timeout"],
												disableChunkedEncoding:
													argv[
														"config-origin-request-disable-chunked-encoding"
													],
												http2Origin: argv["config-origin-request-http2origin"],
												httpHostHeader: resolveFileToken(
													argv["config-origin-request-http-host-header"] as
														| string
														| undefined,
													"config-origin-request-http-host-header",
													"text"
												),
												keepAliveConnections:
													argv["config-origin-request-keep-alive-connections"],
												keepAliveTimeout:
													argv["config-origin-request-keep-alive-timeout"],
												matchSNItoHost:
													argv["config-origin-request-match-snito-host"],
												noHappyEyeballs:
													argv["config-origin-request-no-happy-eyeballs"],
												noTLSVerify: argv["config-origin-request-no-tlsverify"],
												originServerName: resolveFileToken(
													argv["config-origin-request-origin-server-name"] as
														| string
														| undefined,
													"config-origin-request-origin-server-name",
													"text"
												),
												proxyType: resolveFileToken(
													argv["config-origin-request-proxy-type"] as
														| string
														| undefined,
													"config-origin-request-proxy-type",
													"text"
												),
												tcpKeepAlive:
													argv["config-origin-request-tcp-keep-alive"],
												tlsTimeout: argv["config-origin-request-tls-timeout"],
											},
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.tunnels.config.update({
							...bodyData,
							account_id: accountId,
							tunnel_id: argv["tunnel-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config: {
						originRequest: {
							access: {
								audTag: argv["config-origin-request-access-aud-tag"],
								required: argv["config-origin-request-access-required"],
								teamName: resolveFileToken(
									argv["config-origin-request-access-team-name"] as
										| string
										| undefined,
									"config-origin-request-access-team-name",
									"text"
								),
							},
							caPool: resolveFileToken(
								argv["config-origin-request-ca-pool"] as string | undefined,
								"config-origin-request-ca-pool",
								"text"
							),
							connectTimeout: argv["config-origin-request-connect-timeout"],
							disableChunkedEncoding:
								argv["config-origin-request-disable-chunked-encoding"],
							http2Origin: argv["config-origin-request-http2origin"],
							httpHostHeader: resolveFileToken(
								argv["config-origin-request-http-host-header"] as
									| string
									| undefined,
								"config-origin-request-http-host-header",
								"text"
							),
							keepAliveConnections:
								argv["config-origin-request-keep-alive-connections"],
							keepAliveTimeout:
								argv["config-origin-request-keep-alive-timeout"],
							matchSNItoHost: argv["config-origin-request-match-snito-host"],
							noHappyEyeballs: argv["config-origin-request-no-happy-eyeballs"],
							noTLSVerify: argv["config-origin-request-no-tlsverify"],
							originServerName: resolveFileToken(
								argv["config-origin-request-origin-server-name"] as
									| string
									| undefined,
								"config-origin-request-origin-server-name",
								"text"
							),
							proxyType: resolveFileToken(
								argv["config-origin-request-proxy-type"] as string | undefined,
								"config-origin-request-proxy-type",
								"text"
							),
							tcpKeepAlive: argv["config-origin-request-tcp-keep-alive"],
							tlsTimeout: argv["config-origin-request-tls-timeout"],
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.tunnels.config.update({
						...bodyData,
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
