import operation from "../../_operations/tunnels/config/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/tunnels.ts
 */
import type { Argv, CommandModule } from "yargs";
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
		.option("tunnel-config-ingress", {
			type: "string",
			description:
				"List of public hostname definitions. At least one ingress rule needs to be defined for the tunnel. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("tunnel-config-origin-request-access-aud-tag", {
			type: "string",
			array: true,
			description:
				"Access applications that are allowed to reach this hostname for this Tunnel. Audience tags can be identified in the dashboard or via the List Access policies API.",
		})
		.option("tunnel-config-origin-request-access-required", {
			type: "boolean",
			description: "Deny traffic that has not fulfilled Access authorization.",
		})
		.option("tunnel-config-origin-request-access-team-name", {
			type: "string",
			description: "The config.originRequest.access.teamName field",
		})
		.option("tunnel-config-origin-request-ca-pool", {
			type: "string",
			description:
				"Path to the certificate authority (CA) for the certificate of your origin. This option should be used only if your certificate is not signed by Cloudflare.",
		})
		.option("tunnel-config-origin-request-connect-timeout", {
			type: "number",
			description:
				"Timeout for establishing a new TCP connection to your origin server. This excludes the time taken to establish TLS, which is controlled by tlsTimeout.",
		})
		.option("tunnel-config-origin-request-disable-chunked-encoding", {
			type: "boolean",
			description:
				"Disables chunked transfer encoding. Useful if you are running a WSGI server.",
		})
		.option("tunnel-config-origin-request-http2origin", {
			type: "boolean",
			description:
				"Attempt to connect to origin using HTTP2. Origin must be configured as https.",
		})
		.option("tunnel-config-origin-request-http-host-header", {
			type: "string",
			description:
				"Sets the HTTP Host header on requests sent to the local service.",
		})
		.option("tunnel-config-origin-request-keep-alive-connections", {
			type: "number",
			description:
				"Maximum number of idle keepalive connections between Tunnel and your origin. This does not restrict the total number of concurrent connections.",
		})
		.option("tunnel-config-origin-request-keep-alive-timeout", {
			type: "number",
			description:
				"Timeout after which an idle keepalive connection can be discarded.",
		})
		.option("tunnel-config-origin-request-match-snito-host", {
			type: "boolean",
			description:
				"Auto configure the Hostname on the origin server certificate.",
		})
		.option("tunnel-config-origin-request-no-happy-eyeballs", {
			type: "boolean",
			description:
				"Disable the “happy eyeballs” algorithm for IPv4/IPv6 fallback if your local network has misconfigured one of the protocols.",
		})
		.option("tunnel-config-origin-request-no-tlsverify", {
			type: "boolean",
			description:
				"Disables TLS verification of the certificate presented by your origin. Will allow any certificate from the origin to be accepted.",
		})
		.option("tunnel-config-origin-request-origin-server-name", {
			type: "string",
			description:
				"Hostname that cloudflared should expect from your origin server certificate.",
		})
		.option("tunnel-config-origin-request-proxy-type", {
			type: "string",
			description:
				'cloudflared starts a proxy server to translate HTTP traffic into TCP when proxying, for example, SSH or RDP. This configures what type of proxy will be started. Valid options are: "" for the regular proxy and "socks" for a SOCKS5 proxy.\n',
		})
		.option("tunnel-config-origin-request-tcp-keep-alive", {
			type: "number",
			description:
				"The timeout after which a TCP keepalive packet is sent on a connection between Tunnel and the origin server.",
		})
		.option("tunnel-config-origin-request-tls-timeout", {
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
				"tunnel-config-ingress",
				"tunnel-config-origin-request-access-aud-tag",
				"tunnel-config-origin-request-access-required",
				"tunnel-config-origin-request-access-team-name",
				"tunnel-config-origin-request-ca-pool",
				"tunnel-config-origin-request-connect-timeout",
				"tunnel-config-origin-request-disable-chunked-encoding",
				"tunnel-config-origin-request-http2origin",
				"tunnel-config-origin-request-http-host-header",
				"tunnel-config-origin-request-keep-alive-connections",
				"tunnel-config-origin-request-keep-alive-timeout",
				"tunnel-config-origin-request-match-snito-host",
				"tunnel-config-origin-request-no-happy-eyeballs",
				"tunnel-config-origin-request-no-tlsverify",
				"tunnel-config-origin-request-origin-server-name",
				"tunnel-config-origin-request-proxy-type",
				"tunnel-config-origin-request-tcp-keep-alive",
				"tunnel-config-origin-request-tls-timeout",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"tunnel-config-origin-request-access-aud-tag",
					"tunnel-config-origin-request-access-team-name",
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
						"tunnel-config-origin-request-access-required",
						"tunnel-config-origin-request-disable-chunked-encoding",
						"tunnel-config-origin-request-http2origin",
						"tunnel-config-origin-request-match-snito-host",
						"tunnel-config-origin-request-no-happy-eyeballs",
						"tunnel-config-origin-request-no-tlsverify",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
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
};

export default command;
