import operation from "../../../_operations/email-sending/subdomains/reputation/get-complaints.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get-complaints.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "email-sending subdomains reputation get-complaints",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				start_at: argv["start-at"],
				end_at: argv["end-at"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf email-sending subdomains reputation get-complaints",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/sending/subdomains/${argv["subdomain-id"] == null ? "<subdomain-id>" : encodeURIComponent(String(argv["subdomain-id"]))}/reputation/complaints`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"subdomain-id": String(argv["subdomain-id"] ?? ""),
					},
					query: queryParams,
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
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
