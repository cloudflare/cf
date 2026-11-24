import operation from "../../../_operations/custom-hostnames/certificate-pack/certificates/update.js";
/**
 * update command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <certificate-id>",
	describe: "Replace Custom Certificate and Custom Key In Custom Hostname",
	usage:
		"$0 custom-hostnames certificate-pack certificates update <certificate-id>\n\nReplace a single custom certificate within a certificate pack that contains two bundled certificates. The replacement must adhere to the following constraints. You can only replace an RSA certificate with another RSA certificate or an ECDSA certificate with another ECDSA certificate.",
	flags: {
		"custom-hostname-id": {
			kind: "parsed",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
		"certificate-pack-id": {
			kind: "parsed",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
		"custom-certificate": {
			kind: "parsed",
			brief: "If a custom uploaded certificate is used.",
			optional: true,
			parse: String,
		},
		"custom-key": {
			kind: "parsed",
			brief: "The key for a custom uploaded certificate.",
			optional: true,
			parse: String,
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
		{
			placeholder: "certificate-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-hostnames certificate-pack certificates update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf custom-hostnames certificate-pack certificates update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames/${argv["custom-hostname-id"] == null ? "<custom-hostname-id>" : encodeURIComponent(String(argv["custom-hostname-id"]))}/certificate_pack/${argv["certificate-pack-id"] == null ? "<certificate-pack-id>" : encodeURIComponent(String(argv["certificate-pack-id"]))}/certificates/${argv["certificate-id"] == null ? "<certificate-id>" : encodeURIComponent(String(argv["certificate-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"custom-hostname-id": String(argv["custom-hostname-id"] ?? ""),
							"certificate-pack-id": String(argv["certificate-pack-id"] ?? ""),
							"certificate-id": String(argv["certificate-id"] ?? ""),
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							custom_hostname_id: argv["custom-hostname-id"],
							certificate_pack_id: argv["certificate-pack-id"],
							certificate_id: argv["certificate-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						custom_hostname_id: argv["custom-hostname-id"],
						certificate_pack_id: argv["certificate-pack-id"],
						certificate_id: argv["certificate-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
