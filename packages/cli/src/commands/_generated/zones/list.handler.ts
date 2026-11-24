import operation from "../_operations/zones/list.js";
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
			command: "zones list",
			classification: {
				safeFlags: ["status", "order", "direction", "match", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				name: argv["name"],
				status: argv["status"],
				type: argv["type"],
				"account.id": argv["account-id"],
				"account.name": argv["account-name"],
				page: argv["page"],
				per_page: argv["per-page"],
				order: argv["order"],
				direction: argv["direction"],
				match: argv["match"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf zones list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones`,
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
