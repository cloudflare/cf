import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/keyless-certificates.ts
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
			"$0 keyless-certificates edit <keyless-certificate-id>\n\nThis will update attributes of a Keyless SSL. Consists of one or more of the following: host,name,port."
		)
		.positional("keyless-certificate-id", {
			type: "string",
			description: "Keyless certificate identifier tag.",
			demandOption: true,
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether or not the Keyless SSL is on or off.",
		})
		.option("host", { type: "string", description: "The keyless SSL name." })
		.option("name", { type: "string", description: "The keyless SSL name." })
		.option("port", {
			type: "number",
			description:
				"The keyless SSL port used to communicate between Cloudflare and the client's Keyless SSL server.",
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
	SdkRequest<"keyless-ssl-for-a-zone-edit-keyless-ssl-configuration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <keyless-certificate-id>",
	describe: "Edit Keyless SSL Configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "keyless-certificates edit",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf keyless-certificates edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/keyless_certificates/${argv["keyless-certificate-id"] == null ? "<keyless-certificate-id>" : encodeURIComponent(String(argv["keyless-certificate-id"]))}`,
						pathParams: {
							"keyless-certificate-id": String(
								argv["keyless-certificate-id"] ?? ""
							),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
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
					const result = await withProgress(`Updating`, async () =>
						client.keylessCertificates.edit({
							...bodyData,
							zone_id: zoneId,
							keyless_certificate_id: argv["keyless-certificate-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					enabled: argv["enabled"],
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
				const result = await withProgress(`Updating`, async () =>
					client.keylessCertificates.edit({
						...bodyData,
						zone_id: zoneId,
						keyless_certificate_id: argv["keyless-certificate-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
