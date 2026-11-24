import operation from "../../_operations/ssl/certificate-packs/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ssl certificate-packs create",
			classification: {
				safeFlags: [
					"certificate-authority",
					"cloudflare-branding",
					"type",
					"validation-method",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["certificate-authority"] === undefined) {
					argv["certificate-authority"] = await promptForRequiredEnumField(
						"certificate-authority",
						"Certificate Authority selected for the order.  For information on any certificate authority specific details or restrictions [see this page for more details](https://developers.cloudflare.com/ssl/reference/certificate-authorities).",
						["google", "lets_encrypt", "ssl_com"] as const
					);
				}
				if (argv["hosts"] === undefined) {
					throw new Error(
						"--hosts is required (or pass --body with this field set)."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"Type of certificate pack.",
						["advanced"] as const
					);
				}
				if (argv["validation-method"] === undefined) {
					argv["validation-method"] = await promptForRequiredEnumField(
						"validation-method",
						"Validation Method selected for the order.",
						["txt", "http", "email"] as const
					);
				}
				if (argv["validity-days"] === undefined) {
					throw new Error(
						"--validity-days is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf ssl certificate-packs create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/ssl/certificate_packs/order`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									certificate_authority: argv["certificate-authority"],
									cloudflare_branding: argv["cloudflare-branding"],
									hosts: argv["hosts"],
									type: argv["type"],
									validation_method: argv["validation-method"],
									validity_days: argv["validity-days"],
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				certificate_authority: argv["certificate-authority"],
				cloudflare_branding: argv["cloudflare-branding"],
				hosts: argv["hosts"],
				type: argv["type"],
				validation_method: argv["validation-method"],
				validity_days: argv["validity-days"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
