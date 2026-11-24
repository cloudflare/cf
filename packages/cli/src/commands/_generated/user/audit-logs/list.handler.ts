import operation from "../../_operations/user/audit-logs/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user audit-logs list",
			classification: {
				safeFlags: ["export", "direction", "hide-user-logs", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				id: argv["id"],
				export: argv["export"],
				"action.type": argv["action-type"],
				"actor.ip": argv["actor-ip"],
				"actor.email": argv["actor-email"],
				since: argv["since"],
				before: argv["before"],
				"zone.name": argv["zone-name"],
				direction: argv["direction"],
				per_page: argv["per-page"],
				page: argv["page"],
				hide_user_logs: argv["hide-user-logs"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user audit-logs list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/user/audit_logs`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, queryParams)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
