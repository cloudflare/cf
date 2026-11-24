import operation from "../_operations/security-txt/update.js";
/**
 * update command
 * @generated from apis/overlays/security-txt.ts
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
	command: "update",
	describe: "Updates security.txt",
	usage:
		"$0 security-txt update\n\nUpdates the security.txt file configuration for a zone, which provides security researchers with vulnerability reporting information.",
	flags: {
		acknowledgments: {
			kind: "parsed",
			brief:
				"Link(s) to a page where security researchers are recognised for their reports.",
			variadic: true,
			optional: true,
			parse: String,
		},
		canonical: {
			kind: "parsed",
			brief: "Canonical URI where the security.txt file is located.",
			variadic: true,
			optional: true,
			parse: String,
		},
		contact: {
			kind: "parsed",
			brief:
				"Methods that researchers should use for reporting vulnerabilities. Can be a URI for an email address, phone number, or URL.",
			variadic: true,
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether or not to serve the security.txt file in this zone. If false, security.txt requests will pass through to the origin server.",
			optional: true,
		},
		encryption: {
			kind: "parsed",
			brief:
				"URI(s) pointing to a location where an encryption key that researchers should use for encrypted communications can be retrieved. The key itself must not appear in this field.",
			variadic: true,
			optional: true,
			parse: String,
		},
		expires: {
			kind: "parsed",
			brief:
				"RFC3339-formatted date and time string indicating the time that, after which, the contents of the security.txt file should be considered stale. It is recommended that this value is less than a year into the future.",
			optional: true,
			parse: String,
		},
		hiring: {
			kind: "parsed",
			brief: "Link(s) to any security-related job positions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		policy: {
			kind: "parsed",
			brief: "Link(s) to where a vulnerability disclosure policy is located.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"preferred-languages": {
			kind: "parsed",
			brief:
				"Comma-separated list of natural languages that are preferred when submitting security reports. Language codes should be as defined in RFC5646.",
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
			brief: "Configuration of the zone security.txt file",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-txt update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["contact"] === undefined) {
						throw new Error(
							"--contact is required (or pass --body with this field set)."
						);
					}
					if (argv["expires"] === undefined) {
						argv["expires"] = await promptForRequiredField(
							"expires",
							"RFC3339-formatted date and time string indicating the time that, after which, the contents of the security.txt file should be considered stale. It is recommended that this value is less than a year into the future."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf security-txt update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/security-center/securitytxt`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										acknowledgments: argv["acknowledgments"],
										canonical: argv["canonical"],
										contact: argv["contact"],
										enabled: argv["enabled"],
										encryption: argv["encryption"],
										expires: resolveFileToken(
											argv["expires"] as string | undefined,
											"expires",
											"text"
										),
										hiring: argv["hiring"],
										policy: argv["policy"],
										preferred_languages: resolveFileToken(
											argv["preferred-languages"] as string | undefined,
											"preferred-languages",
											"text"
										),
									}),
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
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					acknowledgments: argv["acknowledgments"],
					canonical: argv["canonical"],
					contact: argv["contact"],
					enabled: argv["enabled"],
					encryption: argv["encryption"],
					expires: resolveFileToken(
						argv["expires"] as string | undefined,
						"expires",
						"text"
					),
					hiring: argv["hiring"],
					policy: argv["policy"],
					preferred_languages: resolveFileToken(
						argv["preferred-languages"] as string | undefined,
						"preferred-languages",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
