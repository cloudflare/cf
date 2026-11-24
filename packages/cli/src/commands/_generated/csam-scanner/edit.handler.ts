import operation from "../_operations/csam-scanner/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "csam-scanner edit",
			classification: {
				safeFlags: ["id", "value-enabled", "value-resend-email", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf csam-scanner edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/csam_scanner_third_party`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										id: argv["id"],
										value: {
											email: resolveFileToken(
												argv["value-email"] as string | undefined,
												"value-email",
												"text"
											),
											enabled: argv["value-enabled"],
											resend_email: argv["value-resend-email"],
											sources: parseJsonMap(
												argv["value-sources"],
												"value-sources"
											),
										},
									},
									[["value", "sources"]]
								),
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

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					id: argv["id"],
					value: {
						email: resolveFileToken(
							argv["value-email"] as string | undefined,
							"value-email",
							"text"
						),
						enabled: argv["value-enabled"],
						resend_email: argv["value-resend-email"],
						sources: parseJsonMap(argv["value-sources"], "value-sources"),
					},
				},
				[["value", "sources"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
