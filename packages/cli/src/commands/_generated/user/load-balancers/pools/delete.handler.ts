import operation from "../../../_operations/user/load-balancers/pools/delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user load-balancers pools delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user load-balancers pools delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools/${argv["pool-id"] == null ? "<pool-id>" : encodeURIComponent(String(argv["pool-id"]))}`,
					pathParams: { "pool-id": String(argv["pool-id"] ?? "") },
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
				return;
			}

			const result = await withProgress(`Deleting`, async () =>
				client.send(operation, { pool_id: argv["pool-id"] })
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
