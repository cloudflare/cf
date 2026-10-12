import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/keyless-certificates.ts
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
			"$0 keyless-certificates create\n\nCreates a Keyless SSL configuration that allows SSL/TLS termination without exposing private keys to Cloudflare. Keys remain on your infrastructure."
		)
		.option("bundle-method", {
			type: "string",
			description:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			choices: ["ubiquitous", "optimal", "force"],
			default: "ubiquitous",
		})
		.coerce("bundle-method", (value) =>
			resolveFileToken(value, "bundle-method", "text")
		)
		.option("certificate", {
			type: "string",
			description:
				"The zone's SSL certificate or SSL certificate and intermediate(s).",
		})
		.option("host", { type: "string", description: "The keyless SSL name." })
		.option("name", { type: "string", description: "The keyless SSL name." })
		.option("port", {
			type: "number",
			description:
				"The keyless SSL port used to communicate between Cloudflare and the client's Keyless SSL server.",
			default: 24008,
		})
		.option("tunnel-private-ip", {
			type: "string",
			description: "Private IP of the Key Server Host.",
		})
		.option("tunnel-vnet-id", {
			type: "string",
			description: "Cloudflare Tunnel Virtual Network ID.",
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
			const groupSet = ["tunnel-private-ip", "tunnel-vnet-id"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["tunnel-private-ip", "tunnel-vnet-id"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --tunnel-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"keyless-ssl-for-a-zone-create-keyless-ssl-configuration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Keyless SSL Configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "keyless-certificates create",
				classification: {
					safeFlags: ["bundle-method", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf keyless-certificates create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/keyless_certificates`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bundle_method: argv["bundle-method"],
										certificate: resolveFileToken(
											argv["certificate"] as string | undefined,
											"certificate",
											"text"
										),
										host: resolveFileToken(
											argv["host"] as string | undefined,
											"host",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										port: argv["port"],
										tunnel: {
											private_ip: resolveFileToken(
												argv["tunnel-private-ip"] as string | undefined,
												"tunnel-private-ip",
												"text"
											),
											vnet_id: resolveFileToken(
												argv["tunnel-vnet-id"] as string | undefined,
												"tunnel-vnet-id",
												"text"
											),
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
					const result = await withProgress(`Creating`, async () =>
						client.keylessCertificates.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["certificate"] === undefined) {
					argv["certificate"] = await promptForRequiredField(
						"certificate",
						"The zone's SSL certificate or SSL certificate and intermediate(s)."
					);
				}
				if (argv["host"] === undefined) {
					argv["host"] = await promptForRequiredField(
						"host",
						"The keyless SSL name."
					);
				}
				if (argv["port"] === undefined) {
					throw new Error(
						"--port is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					bundle_method: argv["bundle-method"],
					certificate: resolveFileToken(
						argv["certificate"] as string | undefined,
						"certificate",
						"text"
					),
					host: resolveFileToken(
						argv["host"] as string | undefined,
						"host",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					port: argv["port"],
					tunnel: {
						private_ip: resolveFileToken(
							argv["tunnel-private-ip"] as string | undefined,
							"tunnel-private-ip",
							"text"
						),
						vnet_id: resolveFileToken(
							argv["tunnel-vnet-id"] as string | undefined,
							"tunnel-vnet-id",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.keylessCertificates.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
