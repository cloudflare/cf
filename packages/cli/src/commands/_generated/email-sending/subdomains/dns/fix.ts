import operation from "../../../_operations/email-sending/subdomains/dns/fix.js";
/**
 * fix command
 * @generated from apis/overlays/email-sending.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "fix <subdomain-id>",
	describe: "Fix sending subdomain DNS records",
	usage:
		"$0 email-sending subdomains dns fix <subdomain-id>\n\nIdempotently re-applies the sending DNS records (creates missing records, re-applies the email_routing lock on records whose lock has been cleared). Refuses with a 409 if foreign MX, multiple SPF, multiple DMARC, or multiple DKIM records exist at the relevant DNS names — those require manual cleanup.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
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
				command: "email-sending subdomains dns fix",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-sending subdomains dns fix",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/sending/subdomains/${argv["subdomain-id"] == null ? "<subdomain-id>" : encodeURIComponent(String(argv["subdomain-id"]))}/dns`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"subdomain-id": String(argv["subdomain-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						zone_id: zoneId,
						subdomain_id: argv["subdomain-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
