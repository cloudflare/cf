import operation from "../../_operations/email-routing/settings/replace.js";
/**
 * replace command
 * @generated from apis/overlays/email-routing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "replace",
	describe: "Apply Email Routing settings",
	usage:
		"$0 email-routing settings replace\n\nApply the provided settings to your Email Routing zone. Omitted settings retain their current values, as with PATCH.",
	flags: {
		enabled: {
			kind: "boolean",
			brief:
				"State of your zone Email Routing settings. No-op on this endpoint - use `POST`/`DELETE /zones/{zone_id}/email/routing/dns`.",
			optional: true,
		},
		"skip-wizard": {
			kind: "boolean",
			brief: "Flag to check if the user skipped the configuration wizard.",
			optional: true,
		},
		"support-subaddress": {
			kind: "boolean",
			brief:
				"Whether subaddressing (plus-addressing) is honored when matching incoming mail against routing rules.",
			optional: true,
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
				command: "email-routing settings replace",
				classification: {
					safeFlags: [
						"enabled",
						"skip-wizard",
						"support-subaddress",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-routing settings replace",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/routing`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										skip_wizard: argv["skip-wizard"],
										support_subaddress: argv["support-subaddress"],
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
					enabled: argv["enabled"],
					skip_wizard: argv["skip-wizard"],
					support_subaddress: argv["support-subaddress"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
