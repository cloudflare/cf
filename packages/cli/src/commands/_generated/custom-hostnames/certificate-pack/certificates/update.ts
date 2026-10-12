import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
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
			"$0 custom-hostnames certificate-pack certificates update <certificate-id>\n\nReplace a single custom certificate within a certificate pack that contains two bundled certificates. The replacement must adhere to the following constraints. You can only replace an RSA certificate with another RSA certificate or an ECDSA certificate with another ECDSA certificate."
		)
		.positional("certificate-id", {
			type: "string",
			description: "Custom hostname identifier tag.",
			demandOption: true,
		})
		.option("custom-hostname-id", {
			type: "string",
			description: "Custom hostname identifier tag.",
			demandOption: true,
		})
		.option("certificate-pack-id", {
			type: "string",
			description: "Custom hostname identifier tag.",
			demandOption: true,
		})
		.option("custom-certificate", {
			type: "string",
			description: "If a custom uploaded certificate is used.",
		})
		.option("custom-key", {
			type: "string",
			description: "The key for a custom uploaded certificate.",
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

type Request =
	SdkRequest<"custom-hostname-for-a-zone-edit-custom-certificate-custom-hostname">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <certificate-id>",
	describe: "Replace Custom Certificate and Custom Key In Custom Hostname",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-hostnames certificate-pack certificates update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames certificate-pack certificates update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames/${argv["custom-hostname-id"] == null ? "<custom-hostname-id>" : encodeURIComponent(String(argv["custom-hostname-id"]))}/certificate_pack/${argv["certificate-pack-id"] == null ? "<certificate-pack-id>" : encodeURIComponent(String(argv["certificate-pack-id"]))}/certificates/${argv["certificate-id"] == null ? "<certificate-id>" : encodeURIComponent(String(argv["certificate-id"]))}`,
						pathParams: {
							"custom-hostname-id": String(argv["custom-hostname-id"] ?? ""),
							"certificate-pack-id": String(argv["certificate-pack-id"] ?? ""),
							"certificate-id": String(argv["certificate-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										custom_certificate: resolveFileToken(
											argv["custom-certificate"] as string | undefined,
											"custom-certificate",
											"text"
										),
										custom_key: resolveFileToken(
											argv["custom-key"] as string | undefined,
											"custom-key",
											"text"
										),
									}),
						sensitiveBodyPaths: [["custom_key"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.customHostnames.certificatePack.certificates.update({
							body: bodyData,
							zone_id: zoneId,
							custom_hostname_id: argv["custom-hostname-id"],
							certificate_pack_id: argv["certificate-pack-id"],
							certificate_id: argv["certificate-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["custom-certificate"] === undefined) {
					argv["custom-certificate"] = await promptForRequiredField(
						"custom-certificate",
						"If a custom uploaded certificate is used."
					);
				}
				if (argv["custom-key"] === undefined) {
					argv["custom-key"] = await promptForRequiredField(
						"custom-key",
						"The key for a custom uploaded certificate.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					custom_certificate: resolveFileToken(
						argv["custom-certificate"] as string | undefined,
						"custom-certificate",
						"text"
					),
					custom_key: resolveFileToken(
						argv["custom-key"] as string | undefined,
						"custom-key",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.customHostnames.certificatePack.certificates.update({
						body: bodyData,
						zone_id: zoneId,
						custom_hostname_id: argv["custom-hostname-id"],
						certificate_pack_id: argv["certificate-pack-id"],
						certificate_id: argv["certificate-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
