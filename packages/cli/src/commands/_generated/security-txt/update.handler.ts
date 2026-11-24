import operation from "../_operations/security-txt/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
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
	);
}
