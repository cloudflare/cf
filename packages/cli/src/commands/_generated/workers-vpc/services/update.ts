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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/workers-vpc.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-vpc services update <service-id>\n\nUpdates an existing Workers VPC connectivity service by its ID."
		)
		.positional("service-id", {
			type: "string",
			description: "Service ID",
			demandOption: true,
		})
		.option("host-ipv4", { type: "string", description: "The host.ipv4 field" })
		.option("host-network-tunnel-id", {
			type: "string",
			description: "The host.network.tunnel_id field",
		})
		.option("host-ipv6", { type: "string", description: "The host.ipv6 field" })
		.option("host-hostname", {
			type: "string",
			description: "The host.hostname field",
		})
		.option("host-resolver-network-resolver-ips", {
			type: "string",
			array: true,
			description: "The host.resolver_network.resolver_ips field",
		})
		.option("host-resolver-network-tunnel-id", {
			type: "string",
			description: "The host.resolver_network.tunnel_id field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("tls-settings-cert-verification-mode", {
			type: "string",
			description:
				'TLS certificate verification mode for the connection to the origin.\n\n- `"verify_full"` — verify certificate chain and hostname (default)\n- `"verify_ca"` — verify certificate chain only, skip hostname check\n- `"disabled"` — do not verify the server certificate at all',
		})
		.option("type", {
			type: "string",
			description: "The type field",
			choices: ["tcp", "http"],
		})
		.option("http-port", { type: "number", description: "The http_port field" })
		.option("https-port", {
			type: "number",
			description: "The https_port field",
		})
		.option("app-protocol", {
			type: "string",
			description: "The app_protocol field",
			choices: ["postgresql", "mysql"],
		})
		.option("tcp-port", { type: "number", description: "The tcp_port field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("host-ipv4", [
			"host-ipv6",
			"host-hostname",
			"host-resolver-network-resolver-ips",
		])
		.conflicts("host-ipv6", [
			"host-ipv4",
			"host-hostname",
			"host-resolver-network-resolver-ips",
		])
		.conflicts("host-hostname", ["host-ipv4", "host-ipv6"])
		.conflicts("host-resolver-network-resolver-ips", ["host-ipv4", "host-ipv6"])
		.conflicts("http-port", ["app-protocol", "tcp-port"])
		.conflicts("https-port", ["app-protocol", "tcp-port"])
		.conflicts("app-protocol", ["http-port", "https-port"])
		.conflicts("tcp-port", ["http-port", "https-port"])
		.check((argv) => {
			const groupSet = [
				"host-ipv4",
				"host-network-tunnel-id",
				"host-ipv6",
				"host-hostname",
				"host-resolver-network-resolver-ips",
				"host-resolver-network-tunnel-id",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"host-network-tunnel-id",
					"host-resolver-network-tunnel-id",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --host-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = ["tls-settings-cert-verification-mode"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["tls-settings-cert-verification-mode"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --tls_settings-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"connectivity-services-put">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <service-id>",
	describe: "Update Workers VPC connectivity service",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers-vpc services update",
				classification: {
					safeFlags: ["type", "app-protocol", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
										},
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
										http_port: argv["http-port"],
										https_port: argv["https-port"],
										app_protocol: resolveFileToken(
											argv["app-protocol"] as string | undefined,
											"app-protocol",
											"text"
										),
										tcp_port: argv["tcp-port"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.workersVpc.services.update({
							body: bodyData,
							account_id: accountId,
							service_id: argv["service-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					},
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
					http_port: argv["http-port"],
					https_port: argv["https-port"],
					app_protocol: resolveFileToken(
						argv["app-protocol"] as string | undefined,
						"app-protocol",
						"text"
					),
					tcp_port: argv["tcp-port"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.workersVpc.services.update({
						body: bodyData,
						account_id: accountId,
						service_id: argv["service-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
