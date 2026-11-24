import operation from "../../../_operations/ssl/origin-tls-client-auth/zone-certificates/create.js";
/**
 * create command
 * @generated from apis/overlays/ssl.ts
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
	command: "create",
	describe: "Upload Certificate",
	usage:
		"$0 ssl origin-tls-client-auth zone-certificates create\n\nUpload your own certificate you want Cloudflare to use for edge-to-origin communication to override the shared certificate. Please note that it is important to keep only one certificate active. Also, make sure to enable zone-level authenticated origin pulls by making a PUT call to settings endpoint to see the uploaded certificate in use.",
	flags: {
		certificate: {
			kind: "parsed",
			brief: "The zone's leaf certificate.",
			optional: true,
			parse: String,
		},
		"private-key": {
			kind: "parsed",
			brief: "The zone's private key.",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl origin-tls-client-auth zone-certificates create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["certificate"] === undefined) {
						argv["certificate"] = await promptForRequiredField(
							"certificate",
							"The zone's leaf certificate."
						);
					}
					if (argv["private-key"] === undefined) {
						argv["private-key"] = await promptForRequiredField(
							"private-key",
							"The zone's private key.",
							{ kind: "secret" }
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf ssl origin-tls-client-auth zone-certificates create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin_tls_client_auth`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										certificate: resolveFileToken(
											argv["certificate"] as string | undefined,
											"certificate",
											"text"
										),
										private_key: resolveFileToken(
											argv["private-key"] as string | undefined,
											"private-key",
											"text"
										),
									}),
						sensitiveBodyPaths: [["private_key"]],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					certificate: resolveFileToken(
						argv["certificate"] as string | undefined,
						"certificate",
						"text"
					),
					private_key: resolveFileToken(
						argv["private-key"] as string | undefined,
						"private-key",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
