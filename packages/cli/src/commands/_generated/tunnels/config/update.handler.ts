import operation from "../../_operations/tunnels/config/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
													argv["tunnel-config-origin-request-access-required"],
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
												argv["tunnel-config-origin-request-keep-alive-timeout"],
											matchSNItoHost:
												argv["tunnel-config-origin-request-match-snito-host"],
											noHappyEyeballs:
												argv["tunnel-config-origin-request-no-happy-eyeballs"],
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
	);
}
