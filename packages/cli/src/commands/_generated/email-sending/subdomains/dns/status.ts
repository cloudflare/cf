import operation from "../../../_operations/email-sending/subdomains/dns/status.js";
/**
 * status command
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
	command: "status <subdomain-id>",
	describe: "Get sending subdomain DNS status",
	usage:
		"$0 email-sending subdomains dns status <subdomain-id>\n\nReturns the desired DNS records for a sending subdomain along with a live diff against actual DNS state. Use this to detect missing, unlocked, foreign, or multi-record conflicts before deciding whether to call the fix endpoint. For wildcard sending rows, each call also rechecks the governing organizational-domain DMARC policy and reports policy drift that DNS Fix cannot repair.",
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
				command: "email-sending subdomains dns status",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-sending subdomains dns status",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/sending/subdomains/${argv["subdomain-id"] == null ? "<subdomain-id>" : encodeURIComponent(String(argv["subdomain-id"]))}/dns/status`,
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

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						zone_id: zoneId,
						subdomain_id: argv["subdomain-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
