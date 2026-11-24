import operation from "../../_operations/email-sending/subdomains/update.js";
/**
 * update command
 * @generated from apis/overlays/email-sending.ts
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
	command: "update <subdomain-id>",
	describe: "Update a sending subdomain",
	usage:
		"$0 email-sending subdomains update <subdomain-id>\n\nUpdates the activity-log preview preference for a sending subdomain.",
	flags: {
		"drop-suppressed-recipients": {
			kind: "boolean",
			brief:
				"Whether a send request that includes a recipient suppressed on\nthis subdomain drops that recipient and still delivers to the\nrest, instead of failing the entire request.\n",
			optional: true,
		},
		"preview-enabled": {
			kind: "boolean",
			brief:
				"Whether sent messages from this subdomain can be previewed in the activity log.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"At least one of `preview_enabled` or `drop_suppressed_recipients` must be provided. A field omitted from the request body is left unchanged. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "subdomain-id",
			brief: "Sending subdomain identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending subdomains update",
				classification: {
					safeFlags: [
						"drop-suppressed-recipients",
						"preview-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-sending subdomains update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/sending/subdomains/${argv["subdomain-id"] == null ? "<subdomain-id>" : encodeURIComponent(String(argv["subdomain-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"subdomain-id": String(argv["subdomain-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										drop_suppressed_recipients:
											argv["drop-suppressed-recipients"],
										preview_enabled: argv["preview-enabled"],
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
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							subdomain_id: argv["subdomain-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					drop_suppressed_recipients: argv["drop-suppressed-recipients"],
					preview_enabled: argv["preview-enabled"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						subdomain_id: argv["subdomain-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
