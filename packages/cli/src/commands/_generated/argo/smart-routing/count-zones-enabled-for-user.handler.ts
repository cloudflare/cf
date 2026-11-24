import operation from "../../_operations/argo/smart-routing/count-zones-enabled-for-user.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./count-zones-enabled-for-user.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "argo smart-routing count-zones-enabled-for-user",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf argo smart-routing count-zones-enabled-for-user",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/user/argo/count_zones_enabled`,
					pathParams: {},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
