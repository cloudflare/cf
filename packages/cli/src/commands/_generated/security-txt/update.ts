import operation from "../_operations/security-txt/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/security-txt.ts
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
			"$0 security-txt update\n\nUpdates the security.txt file configuration for a zone, which provides security researchers with vulnerability reporting information."
		)
		.option("acknowledgments", {
			type: "string",
			array: true,
			description:
				"Link(s) to a page where security researchers are recognised for their reports.",
		})
		.option("canonical", {
			type: "string",
			array: true,
			description: "Canonical URI where the security.txt file is located.",
		})
		.option("contact", {
			type: "string",
			array: true,
			description:
				"Methods that researchers should use for reporting vulnerabilities. Can be a URI for an email address, phone number, or URL.",
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Whether or not to serve the security.txt file in this zone. If false, security.txt requests will pass through to the origin server.",
		})
		.option("encryption", {
			type: "string",
			array: true,
			description:
				"URI(s) pointing to a location where an encryption key that researchers should use for encrypted communications can be retrieved. The key itself must not appear in this field.",
		})
		.option("expires", {
			type: "string",
			description:
				"RFC3339-formatted date and time string indicating the time that, after which, the contents of the security.txt file should be considered stale. It is recommended that this value is less than a year into the future.",
		})
		.option("hiring", {
			type: "string",
			array: true,
			description: "Link(s) to any security-related job positions.",
		})
		.option("policy", {
			type: "string",
			array: true,
			description:
				"Link(s) to where a vulnerability disclosure policy is located.",
		})
		.option("preferred-languages", {
			type: "string",
			description:
				"Comma-separated list of natural languages that are preferred when submitting security reports. Language codes should be as defined in RFC5646.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Configuration of the zone security.txt file",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Updates security.txt",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-txt update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
};

export default command;
