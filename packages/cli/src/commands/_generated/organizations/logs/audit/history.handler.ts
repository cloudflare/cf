import operation from "../../../_operations/organizations/logs/audit/history.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./history.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "organizations logs audit history",
			classification: {
				safeFlags: ["direction", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				action_time: argv["action-time"],
				since: argv["since"],
				before: argv["before"],
				direction: argv["direction"],
				limit: argv["limit"],
				cursor: argv["cursor"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf organizations logs audit history",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/logs/audit/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/history`,
					pathParams: {
						"organization-id": String(argv["organization-id"] ?? ""),
						id: String(argv["id"] ?? ""),
					},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					organization_id: argv["organization-id"],
					id: argv["id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
